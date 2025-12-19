
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('./database.db');
const password = 'password123';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error("Error hashing:", err);
        return;
    }
    console.log("Generated Hash:", hash);

    const sql = `UPDATE Users SET password_hash = ? WHERE email = ?`;

    db.serialize(() => {
        // Update admin1
        db.run(sql, [hash, 'admin1@plume.pixel'], function (err) {
            if (err) console.error("Error updating admin1:", err);
            else console.log(`Updated admin1. Rows affected: ${this.changes}`);
        });

        // Update admin2
        db.run(sql, [hash, 'admin2@plume.pixel'], function (err) {
            if (err) console.error("Error updating admin2:", err);
            else console.log(`Updated admin2. Rows affected: ${this.changes}`);
        });

        // Check what we have
        db.all("SELECT email, password_hash FROM Users WHERE email LIKE 'admin%'", [], (err, rows) => {
            if (err) console.error(err);
            else console.log("Final State:", rows);
        });
    });
});
