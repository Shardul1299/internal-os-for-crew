DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'creator_profiles','creator_calendar_items','creator_platforms','creator_roadmap_items',
    'studio_outliers','studio_hook_stacks','studio_scripts','studio_script_templates',
    'studio_carousels','studio_posts','deliverable_metrics'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_audit ON %I', t, t);
    EXECUTE format('CREATE TRIGGER %I_audit AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION snoball_audit()', t, t);
  END LOOP;
END $$;
