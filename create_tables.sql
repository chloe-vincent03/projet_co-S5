DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS media_tags;

-- Table des médias
CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    
    type TEXT NOT NULL,          -- image, audio, video, text
    url TEXT,                    -- pour les images/vidéos/audio
    content TEXT,                -- pour les textes

    user_id INTEGER,
    parent_id INTEGER, -- NULL si oeuvre originale, ID du parent si réponse (collaboration)
    is_public INTEGER DEFAULT 1, -- 1=Public, 0=Privé
    allow_collaboration INTEGER DEFAULT 1, -- 1=Oui, 0=Non
    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY(user_id) REFERENCES Users(user_id),
    FOREIGN KEY(parent_id) REFERENCES Media(id) ON DELETE SET NULL
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

CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_private INTEGER DEFAULT 0,
  UNIQUE(user_id, media_id)
);


CREATE TABLE IF NOT EXISTS Messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);
