-- Add stripeWebhookSecret column to Project table
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "stripeWebhookSecret" TEXT;

COMMENT ON COLUMN "Project"."stripeWebhookSecret" IS 'User-provided Stripe webhook signing secret for revenue tracking';
