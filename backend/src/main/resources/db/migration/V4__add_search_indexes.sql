CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_documents_title_trgm ON documents USING gin (title gin_trgm_ops);
CREATE INDEX idx_documents_body_trgm ON documents USING gin (markdown_body gin_trgm_ops);
