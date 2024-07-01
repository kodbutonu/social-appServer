const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');

// Görsel yükleme için disk depolama ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Görsellerin kaydedileceği klasör yolu
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Yüklenecek görselin adı (zaman damgası ile benzersiz yapılır)
    }
});

const upload = multer({ storage: storage });

// Görsel yükleme endpoint'i
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        // Görselin dosya yolu (path)
        const imagePath = req.file.path; // Örneğin: 'public/images/1625094012345.jpg'

        // Yeni bir post oluşturma ve veritabanına kaydetme
        const newPost = new Post({
            title: req.body.title,
            description: req.body.description,
            imageUrl: imagePath 
        });

        const savedPost = await newPost.save();
        res.json(savedPost);
    } catch (err) {
        console.error('Görsel yükleme hatası:', err);
        res.status(500).json({ error: 'Görsel yükleme sırasında bir hata oluştu' });
    }
});

module.exports = router;
