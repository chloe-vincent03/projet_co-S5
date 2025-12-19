-- ============================================
-- USER TABLES FOR RECIPE WEBSITE
-- ============================================

DROP TABLE IF EXISTS Users;

-- Table "Users" (Utilisateurs)
CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    bio TEXT DEFAULT '',
    avatar TEXT DEFAULT '/default-avatar.png',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_admin INTEGER DEFAULT 0,
    is_private INTEGER DEFAULT 0
);


-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample users (password is 'password123' hashed with bcrypt)
-- Note: These are example hashes - in production, hash passwords properly!
INSERT INTO Users (username, email, password_hash, first_name, last_name, bio) VALUES
('john_doe', 'john@example.com', '$2b$10$WD5w2l2tI9T.AKGfv1.OYvz563Bwq/7KoA', 'John', 'Doe', 'coucou'),
('jane_smith', 'jane@example.com', '$2b$10$WD5w2l2tI9T.AKGfv1.OYvz563Bwq/7KoA', 'Jane', 'Smith', 'coucou'),
('chef_mike', 'mike@example.com', '$2b$10$WD5w2l2tI9T.AKGfv1.OYvz563Bwq/7KoA', 'Mike', 'Johnson', 'coucou');

INSERT INTO Users (username, email, password_hash, first_name, last_name, bio, is_admin) VALUES
('chloe', 'chloe@admin.com', '$2b$10$WD5w2l2tI9T.AKGfv1.OYvz563Bwq/7KoA', 'Chloe', 'Admin', 'Compte administrateur', 1),
('noelie', 'noelie@admin.com', '$2b$10$WD5w2l2tI9T.AKGfv1.OYvz563Bwq/7KoA', 'Noelie', 'Admin', 'Compte modération', 1);

-- Note: To properly hash passwords, use bcrypt in your Node.js code:
-- const bcrypt = require('bcryptjs');
-- const hashedPassword = await bcrypt.hash('password123', 10);
