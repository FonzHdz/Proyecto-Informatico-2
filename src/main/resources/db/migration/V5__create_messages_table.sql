CREATE TABLE messages (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          content TEXT NOT NULL,
                          date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          file_url VARCHAR(500),
                          type VARCHAR(20) NOT NULL,
                          state VARCHAR(20) NOT NULL,
                          user_id UUID NOT NULL,
                          family_id UUID NOT NULL,
                          creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          last_modified_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                          FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_family ON messages(family_id);
CREATE INDEX idx_messages_user ON messages(user_id);

CREATE OR REPLACE FUNCTION update_last_modified_date_messages()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_date = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_last_modified_date_messages
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified_date_messages();