const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database.sqlite');

const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error("Usage: node seed_user.js <username> <password>");
    process.exit(1);
}

const [username, plainPassword] = args;

async function seedUser() {
    try {
        const passwordHash = await bcrypt.hash(plainPassword, 10);
        
        db.run(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, passwordHash],
            function (err) {
                if (err) {
                    if (err.message.includes("UNIQUE")) {
                        console.error(`User '${username}' already exists!`);
                    } else {
                        console.error("Error creating user:", err.message);
                    }
                } else {
                    console.log(`✅ VIP Account created successfully!`);
                    console.log(`Username: ${username}`);
                    console.log(`Password: ${plainPassword}`);
                    console.log(`(Password securely hashed in DB)`);
                }
                
                db.close();
            }
        );
    } catch (error) {
        console.error("Failed to hash password", error);
        db.close();
    }
}

// Make sure users table exists before trying to insert
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`, () => {
    seedUser();
});
