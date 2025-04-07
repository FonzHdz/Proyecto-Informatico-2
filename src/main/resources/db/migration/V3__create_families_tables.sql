CREATE TABLE families (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          name VARCHAR(255) NOT NULL DEFAULT 'Nueva Familia',
                          photo_url VARCHAR(255) NOT NULL DEFAULT 'default-family.jpg',
                          motto VARCHAR(255) NOT NULL DEFAULT 'Familia unida',
                          invite_code VARCHAR(255) NOT NULL UNIQUE,
                          creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_families_creation_date ON families(creation_date);

CREATE OR REPLACE FUNCTION update_last_modified_date_families()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_date = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_last_modified_date_families
    BEFORE UPDATE ON families
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified_date_families();