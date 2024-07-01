const express = require('express');
const authRoutes = require('./routes/auth.js');
const postRoutes = require('./routes/post.js');
const db = require("./config/index.js");
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

db(); // MongoDB bağlantısı

// Diğer route tanımlamaları
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);

// Server başlatma
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
