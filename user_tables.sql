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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_admin INTEGER DEFAULT 0
);


-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample users (password is 'password123' hashed with bcrypt)
-- Note: These are example hashes - in production, hash passwords properly!
INSERT INTO Users (username, email, password_hash, first_name, last_name) VALUES
('john_doe', 'john@example.com', '$2b$10$rQ8HqUqJ9Z3KvGQHZhYgN.ZYF3xhvVzxhPJXqHqHqHqHqHqHqHqHq', 'John', 'Doe'),
('jane_smith', 'jane@example.com', '$2b$10$rQ8HqUqJ9Z3KvGQHZhYgN.ZYF3xhvVzxhPJXqHqHqHqHqHqHqHqHq', 'Jane', 'Smith'),
('chef_mike', 'mike@example.com', '$2b$10$rQ8HqUqJ9Z3KvGQHZhYgN.ZYF3xhvVzxhPJXqHqHqHqHqHqHqHqHq', 'Mike', 'Johnson');

-- Note: To properly hash passwords, use bcrypt in your Node.js code:
-- const bcrypt = require('bcryptjs');
-- const hashedPassword = await bcrypt.hash('password123', 10);
