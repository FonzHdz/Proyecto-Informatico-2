CREATE TABLE taggeds (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         post_id UUID NOT NULL,
                         user_id UUID NOT NULL,
                         creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         last_modified_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                         UNIQUE(post_id, user_id)
);

CREATE INDEX idx_taggeds_post ON taggeds(post_id);
CREATE INDEX idx_taggeds_user ON taggeds(user_id);

CREATE OR REPLACE FUNCTION update_last_modified_date_taggeds()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_date = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_last_modified_date_taggeds
    BEFORE UPDATE ON taggeds
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified_date_taggeds();