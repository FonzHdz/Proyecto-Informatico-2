-- Crear tabla albums si no existe
CREATE TABLE IF NOT EXISTS albums (
                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                      title VARCHAR(255) NOT NULL,
                                      description TEXT,
                                      family_id UUID NOT NULL,
                                      type VARCHAR(50) NOT NULL,
                                      creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                      cover_image_url VARCHAR(512),
                                      CONSTRAINT fk_album_family FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

-- Crear tabla intermedia si no existe
CREATE TABLE IF NOT EXISTS album_posts (
                                           album_id UUID NOT NULL,
                                           post_id UUID NOT NULL,
                                           PRIMARY KEY (album_id, post_id),
                                           CONSTRAINT fk_album_post_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
                                           CONSTRAINT fk_album_post_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Índices opcionales
CREATE INDEX IF NOT EXISTS idx_album_family ON albums(family_id);
CREATE INDEX IF NOT EXISTS idx_album_type ON albums(type);