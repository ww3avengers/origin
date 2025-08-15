-- Initialize analytics database and user
-- Executed by Postgres entrypoint on first container init

-- On first bootstrap only; entrypoint runs this once for an empty data dir
CREATE USER analytics_user WITH PASSWORD 'analytics_pass';
CREATE DATABASE analytics OWNER analytics_user;
GRANT ALL PRIVILEGES ON DATABASE analytics TO analytics_user;
