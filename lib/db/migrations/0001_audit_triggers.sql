-- Audit log by trigger (BRIEF §14). The acting user is read from the
-- transaction-local setting app.user_id, set by lib/db/tx.ts.
CREATE OR REPLACE FUNCTION snoball_audit() RETURNS trigger AS $$
DECLARE
  rid text;
  payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    rid := (to_jsonb(OLD) ->> 'id');
    payload := jsonb_build_object('old', to_jsonb(OLD));
  ELSIF TG_OP = 'UPDATE' THEN
    rid := (to_jsonb(NEW) ->> 'id');
    payload := jsonb_build_object('changed', (
      SELECT jsonb_object_agg(n.key, jsonb_build_array(to_jsonb(OLD) -> n.key, n.value))
      FROM jsonb_each(to_jsonb(NEW)) n
      WHERE n.key NOT IN ('updated_at') AND (to_jsonb(OLD) -> n.key) IS DISTINCT FROM n.value
    ));
    IF payload -> 'changed' IS NULL THEN RETURN NEW; END IF;
  ELSE
    rid := (to_jsonb(NEW) ->> 'id');
    payload := jsonb_build_object('new', to_jsonb(NEW));
  END IF;
  INSERT INTO audit_log (user_id, entity, entity_id, action, detail)
  VALUES (NULLIF(current_setting('app.user_id', true), ''), TG_TABLE_NAME, rid, lower(TG_OP), payload);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'creators','creator_filter_scores','creator_tier_signals','creator_standard_rates','creator_agreement',
    'creator_topic_filters','creator_anchor_plan','creator_blackouts','creator_checkins',
    'program_cohorts','program_challenges','program_entries','program_sunday_shoots','program_interns',
    'brands','brand_contacts','inbox_threads','brand_feedback',
    'deals','deal_creators','deal_quote_lines','deal_overrides',
    'campaigns','deliverables','invoices','creator_payouts',
    'ladders','deliverable_types','addons','tier_scale','filter_rubric','no_list_items','blocklist_categories',
    'commission_rules','settings','templates','users','ai_settings'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_audit ON %I', t, t);
    EXECUTE format('CREATE TRIGGER %I_audit AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION snoball_audit()', t, t);
  END LOOP;
END $$;
