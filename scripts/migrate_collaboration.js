import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    console.log("Checking for parent_id column in media table...");

    // Check if column exists
    db.all("PRAGMA table_info(media);", (err, rows) => {
        if (err) {
            console.error("Error checking table info:", err);
            return;
        }

        const hasParentId = rows.some(row => row.name === 'parent_id');

        if (!hasParentId) {
            console.log("Adding parent_id column...");
            db.run("ALTER TABLE media ADD COLUMN parent_id INTEGER DEFAULT NULL REFERENCES media(id) ON DELETE SET NULL;", (err) => {
                if (err) {
                    console.error("Error adding column:", err);
                } else {
                    console.log("Column parent_id added successfully.");
                }
                db.close();
            });
        } else {
            console.log("Column parent_id already exists.");
            db.close();
        }
    });
});
