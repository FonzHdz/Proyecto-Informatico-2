CREATE TABLE posts (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       user_id UUID NOT NULL,
                       family_id UUID NOT NULL,
                       description TEXT,
                       files_url VARCHAR(500),
                       creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                       CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                       CONSTRAINT fk_posts_family FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);


CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_family_id ON posts(family_id);
CREATE INDEX idx_posts_creation_date ON posts(creation_date);


CREATE OR REPLACE FUNCTION update_last_modified_date_posts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_date = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER set_last_modified_date_posts
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified_date_posts();