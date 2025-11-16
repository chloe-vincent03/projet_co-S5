-- Insère les médias
INSERT INTO media (title, description, image_url)
VALUES
('Statue de la liberté', 'Statue emblématique située à New York', 'https://pub-498e51fcc7ba483a8fee1aecfaa3d006.r2.dev/src/IMG_9729.JPG'),
('Poème du matin', 'Quelques vers doux pour commencer la journée', NULL),
('Maison au bord d eau', 'Une belle maison située au bord d un lac tranquille', 'https://pub-498e51fcc7ba483a8fee1aecfaa3d006.r2.dev/src/IMG_1709.JPG'),
('son de noël', 'Une mélodie festive pour célébrer les fêtes de fin d année', 'https://pub-498e51fcc7ba483a8fee1aecfaa3d006.r2.dev/src/christmas-holiday-festive-cheer-snow-427231.mp3');

-- Insère les tags
INSERT OR IGNORE INTO tags (name)
VALUES
('monument'), ('New York'), ('histoire'),
('poésie'), ('détente'), ('lecture'),
('maison'), ('lac'), ('paysage'),
('musique'), ('noël'), ('fête');

-- Associe les médias avec leurs tags
-- Statue de la liberté
INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='Statue de la liberté' AND t.name IN ('monument','New York','histoire');

-- Poème du matin
INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='Poème du matin' AND t.name IN ('poésie','détente','lecture');

-- Maison au bord d eau
INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='Maison au bord d eau' AND t.name IN ('maison','lac','paysage');

-- Son de noël
INSERT INTO media_tags (media_id, tag_id)
SELECT m.id, t.id FROM media m, tags t WHERE m.title='son de noël' AND t.name IN ('musique','noël','fête');
