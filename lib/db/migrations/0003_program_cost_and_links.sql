ALTER TABLE "program_cohorts" ADD COLUMN "cost_paise" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "program_entries" ADD COLUMN "deal_id" uuid;--> statement-breakpoint
ALTER TABLE "program_sunday_shoots" ADD COLUMN "cohort_id" uuid;--> statement-breakpoint
ALTER TABLE "program_sunday_shoots" ADD CONSTRAINT "program_sunday_shoots_cohort_id_program_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."program_cohorts"("id") ON DELETE no action ON UPDATE no action;