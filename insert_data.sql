-- Insère les médias (type, url, content)
INSERT INTO media (title, description, type, url, content)
VALUES
-- IMAGE
('Statue de la liberté', 
 'Statue emblématique située à New York', 
 'image',
 'https://pub-498e51fcc7ba483a8fee1aecfaa3d006.r2.dev/src/IMG_9729.JPG',
 NULL
),

-- TEXTE / POÈME
('Poème du matin', 
 'Quelques vers doux pour commencer la journée', 
 'text',
 NULL,
 'Le soleil se lève, effleurant l’horizon,\nLa rosée danse encore sur les fleurs en bouton.\nQuelques mots murmurés, légers comme le vent,\nPour commencer le jour doucement.'
),

-- IMAGE
('Maison au bord d eau', 
 'Une belle maison située au bord d un lac tranquille', 
 'image',
 'https://pub-498e51fcc7ba483a8fee1aecfaa3d006.r2.dev/src/IMG_1709.JPG',
 NULL
),

-- AUDIO
('son de noël', 
 'Une mélodie festive pour célébrer les fêtes de fin d année', 
 'audio',
 'https://pub-498e51fcc7ba483a8fee1aecfaa3d006.r2.dev/src/christmas-holiday-festive-cheer-snow-427231.mp3',
 NULL
),

-- VIDEO
('Vidéo de noël', 
 'Une vidéo festive pour célébrer les fêtes de fin d année', 
 'video',
 'https://pub-498e51fcc7ba483a8fee1aecfaa3d006.r2.dev/src/3565-172488151_small.mp4',
 NULL
),

('Illustration de rivière', 
 'Une illustration apaisante d une rivière au coucher du soleil', 
 'image',
 'https://pub-498e51fcc7ba483a8fee1aecfaa3d006.r2.dev/src/river-8286407_1280.png',
 NULL
),

('Il pleure dans mon cœur',
 'Un poème mélancolique', 
 'text',
 NULL,
 'Il pleure dans mon cœur\nComme il pleut sur la ville;\nQuelle est cette langueur\nQui pénètre mon cœur?\n\nÔ bruit doux de la pluie\nPar terre et sur les toits!\nPour un cœur qui s’ennuie,\nÔ le chant de la pluie!\n\nIl pleure sans raison\nDans ce cœur qui s’écœure.\nQuoi! nulle trahison?...\nCe deuil est sans raison.'
),

('vidéo jour de pluie',
 'Une vidéo relaxante de pluie tombant sur une fenêtre', 
 'video',
 'https://pub-498e51fcc7ba483a8fee1aecfaa3d006.r2.dev/src/270983_small.mp4',
 NULL
),

('musique détente',
 'Une musique apaisante pour la relaxation', 
 'audio',
 'https://pub-498e51fcc7ba483a8fee1aecfaa3d006.r2.dev/src/reunir-284530.mp3',
 NULL
);

-- Insère les tags
INSERT OR IGNORE INTO tags (name)
VALUES
('monument'), ('New York'), ('histoire'),
('poésie'), ('détente'), ('lecture'),
('maison'), ('lac'), ('paysage'),
('musique'), ('noël'), ('fête'),
('vidéo');

-- Associations
INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='Statue de la liberté' AND t.name IN ('monument','New York','histoire');

INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='Poème du matin' AND t.name IN ('poésie','détente','lecture');

INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='Maison au bord d eau' AND t.name IN ('maison','lac','paysage');

INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='son de noël' AND t.name IN ('musique','noël','fête');

INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='Vidéo de noël' AND t.name IN ('vidéo','noël','fête');

INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='Illustration de rivière' AND t.name IN ('paysage','détente');

INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='Il pleure dans mon cœur' AND t.name IN ('poésie','détente','lecture');

INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='vidéo jour de pluie' AND t.name IN ('vidéo','détente', 'paysage');

INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='musique détente' AND t.name IN ('musique','détente');


