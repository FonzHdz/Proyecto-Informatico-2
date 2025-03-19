CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       family_id UUID,
                       first_name VARCHAR(255) NOT NULL,
                       last_name VARCHAR(255) NOT NULL,
                       document_type VARCHAR(50) NOT NULL ,
                       document_number VARCHAR(100) UNIQUE NOT NULL,
                       phone_number VARCHAR(20),
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       gender VARCHAR(50),
                       role VARCHAR(50),
                       creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_document_number ON users(document_number);
CREATE INDEX idx_users_family_id ON users(family_id);

-- Función para actualizar last_modified_date automáticamente
CREATE OR REPLACE FUNCTION update_last_modified_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_date = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar last_modified_date
CREATE TRIGGER set_last_modified_date
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified_date();