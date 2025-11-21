DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS media_tags;

-- Table des médias
CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    
    type TEXT NOT NULL,              -- image, audio, video, text
    url TEXT,                        -- pour les images, audio, vidéo (lien externe ou local)
    content TEXT,                    -- pour les textes / poèmes
    
    created_at TEXT DEFAULT (datetime('now'))
);

-- Table des tags
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Table de liaison entre médias et tags
CREATE TABLE media_tags (
    media_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (media_id, tag_id),
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

