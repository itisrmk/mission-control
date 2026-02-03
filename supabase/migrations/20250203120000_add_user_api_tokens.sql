-- Add user-specific API token columns to Project table
-- This allows each user to use their own API credentials

ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "twitterAccessToken" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "plausibleApiKey" TEXT;

-- Add comments for documentation
COMMENT ON COLUMN "Project"."twitterAccessToken" IS 'User-provided Twitter Bearer Token for fetching their own metrics';
COMMENT ON COLUMN "Project"."plausibleApiKey" IS 'User-provided Plausible API Key for fetching their own analytics';
