
-- Agregar columna last_modified_date a la tabla albums
ALTER TABLE albums
    ADD COLUMN last_modified_date TIMESTAMP;

-- Actualizar los registros existentes con el valor de creation_date
UPDATE albums
SET last_modified_date = creation_date
WHERE last_modified_date IS NULL;

-- Establecer NOT NULL y DEFAULT después de poblar los datos existentes
ALTER TABLE albums
    ALTER COLUMN last_modified_date SET NOT NULL,
ALTER COLUMN last_modified_date SET DEFAULT CURRENT_TIMESTAMP;

-- Crear índice para mejorar consultas por fecha de modificación
CREATE INDEX IF NOT EXISTS idx_album_last_modified ON albums(last_modified_date);