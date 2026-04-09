// This is our Backend Server! (The Kitchen)
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const port = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-vip-key'; // Reads from .env

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/dist')));

// --- CLOUDINARY CONFIGURATION ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'instagram-clone',
        resource_type: 'auto', // Allows video and images
        allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'webp'],
    },
});
const upload = multer({ storage: storage });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// --- DATABASE INITIALIZATION ---
const initDb = async () => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            username TEXT,
            userImage TEXT,
            postImage TEXT,
            likes INTEGER DEFAULT 0,
            caption TEXT,
            isLiked INTEGER DEFAULT 0
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS reels (
            id SERIAL PRIMARY KEY,
            username TEXT,
            userImage TEXT,
            videoUrl TEXT,
            likes INTEGER DEFAULT 0,
            caption TEXT
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            username TEXT,
            text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        const { rows } = await pool.query("SELECT COUNT(*) as count FROM reels");
        if (parseInt(rows[0].count) === 0) {
            console.log("Adding starter Reels into the vault...");
            const starterReels = [
                ["cinematic_creator", "https://ui-avatars.com/api/?name=Creator&background=random", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", 2300, "Incredible blazing fire! 🔥"],
                ["city_vibes", "https://ui-avatars.com/api/?name=Vibes&background=0D8ABC&color=fff", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", 420, "Weird elephant dream 🐘"],
                ["doggo_lover", "https://ui-avatars.com/api/?name=Doggo&background=F5A623&color=fff", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 8900, "Big buck bunny! 🐰"]
            ];

            for (const reel of starterReels) {
                await pool.query(
                    "INSERT INTO reels (username, userImage, videoUrl, likes, caption) VALUES ($1, $2, $3, $4, $5)",
                    reel
                );
            }
            console.log("Starter reels successfully added!");
        }
        console.log("Connected to the PostgreSQL database. 🗄️");
    } catch (err) {
        console.error("Error initializing database", err);
    }
};

initDb();

// --- AUTHENTICATION MIDDLEWARE ---
// The "Bouncer" that checks if the user has a valid VIP Ticket
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) return res.status(401).json({ error: "Access denied. No VIP Ticket." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid VIP Ticket." });
        req.user = user;
        next();
    });
}

// --- LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = rows[0];

        if (!user) return res.status(401).json({ error: "Incorrect username or password." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Incorrect username or password." });

        // Generate VIP Ticket
        const token = jwt.sign({ username: user.username }, JWT_SECRET);
        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route A: Get all posts
app.get('/api/posts', authenticateToken, async (req, res) => {
    try {
        // Fetch posts with comment counts
        const { rows } = await pool.query(`
            SELECT p.*, (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count 
            FROM posts p 
            ORDER BY id DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route B: Like a post
app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
    const { isLiked, likes } = req.body;
    try {
        await pool.query("UPDATE posts SET isLiked = $1, likes = $2 WHERE id = $3", [isLiked ? 1 : 0, likes, req.params.id]);
        res.json({ message: "Post updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route B2: Get comments for a post
app.get('/api/posts/:id/comments', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC", [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route B3: Add a comment
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
    const { username, text } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO comments (post_id, username, text) VALUES ($1, $2, $3) RETURNING id, created_at",
            [req.params.id, username, text]
        );
        res.json({ message: "Comment added!", id: result.rows[0].id, created_at: result.rows[0].created_at });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route B4: Get posts for a specific user (Profile)
app.get('/api/users/:username/posts', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM posts WHERE username = $1 ORDER BY id DESC", [req.params.username]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route C: Create a new post
app.post('/api/posts/new', authenticateToken, upload.single('media'), async (req, res) => {
    // With multer, the file URL is in req.file.path
    const { username, userImage, caption } = req.body;
    const postImage = req.file ? req.file.path : null;
    
    if (!postImage) return res.status(400).json({ error: "Image file is required." });

    try {
        const result = await pool.query(
            "INSERT INTO posts (username, userImage, postImage, likes, caption, isLiked) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [username, userImage, postImage, 0, caption, 0]
        );
        res.json({ message: "Post created successfully!", id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route D: Get all reels!
app.get('/api/reels', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM reels");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route E: CREATE A NEW REEL!
app.post('/api/reels/new', authenticateToken, upload.single('media'), async (req, res) => {
    const { username, userImage, caption } = req.body;
    const videoUrl = req.file ? req.file.path : null;

    if (!videoUrl) return res.status(400).json({ error: "Video file is required." });

    try {
        const result = await pool.query(
            "INSERT INTO reels (username, userImage, videoUrl, likes, caption) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [username, userImage, videoUrl, 0, caption]
        );
        res.json({ message: "Reel created successfully!", id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Catch-all: for any request not handled by the API routes, serve the React app's index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Backend Server is running on http://localhost:${port}`);
});
