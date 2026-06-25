-- Bootstrap extensions for SlideForge Studio
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "vector" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO slideforge;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO slideforge;
