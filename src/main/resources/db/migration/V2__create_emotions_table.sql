
CREATE TABLE emotions (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          user_id UUID NOT NULL,
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          files_url VARCHAR(500),
                          creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_emotions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE INDEX idx_emotions_user_id ON emotions(user_id);

-- Función para actualizar last_modified_date automáticamente
CREATE OR REPLACE FUNCTION update_last_modified_date_emotions()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_date = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar last_modified_date en cada UPDATE
CREATE TRIGGER set_last_modified_date_emotions
    BEFORE UPDATE ON emotions
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified_date_emotions();