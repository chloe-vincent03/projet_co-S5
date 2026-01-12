import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    // Check if column exists
    db.all("PRAGMA table_info(media)", (err, rows) => {
        if (err) {
            console.error("Error getting table info:", err);
            db.close();
            return;
        }

        const columnExists = rows.some(row => row.name === 'status');

        if (!columnExists) {
            console.log("Adding 'status' column to media table...");
            // Default to 'open' (En recherche)
            db.run("ALTER TABLE media ADD COLUMN status TEXT DEFAULT 'open'", (err) => {
                if (err) {
                    console.error("Error adding column:", err.message);
                } else {
                    console.log("Column 'status' added successfully.");
                }
                db.close();
            });
        } else {
            console.log("Column 'status' already exists.");
            db.close();
        }
    });
});
