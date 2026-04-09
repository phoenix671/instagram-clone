require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error("Usage: node seed_user.js <username> <password>");
    process.exit(1);
}

const [username, plainPassword] = args;

async function seedUser() {
    try {
        const passwordHash = await bcrypt.hash(plainPassword, 10);
        
        const result = await pool.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING RETURNING id",
            [username, passwordHash]
        );

        if (result.rows.length === 0) {
            console.error(`User '${username}' already exists!`);
        } else {
            console.log(`✅ VIP Account created successfully!`);
            console.log(`Username: ${username}`);
            console.log(`Password: ${plainPassword}`);
            console.log(`(Password securely hashed in DB)`);
        }
        
        await pool.end();
    } catch (error) {
        console.error("Failed to seed user:", error.message);
        await pool.end();
    }
}

seedUser();
