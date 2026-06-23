CREATE TABLE folders (
  id BIGSERIAL PRIMARY KEY,
  parent_id BIGINT REFERENCES folders(id),
  name VARCHAR(120) NOT NULL,
  path VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by VARCHAR(120)
);

CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_folders_status ON folders(status);
