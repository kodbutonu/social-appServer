const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // JWT kütüphanesi
const User = require('../models/User');
const jwtSecret = process.env.JWT_SECRET ||'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const nodemailer = require('nodemailer');

// Nodemailer ile e-posta gönderme ayarları
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'oergin526@gmail.com', // E-posta adresiniz
        pass: 'dawy fyyl xesk seno' // E-posta şifreniz
    },
    tls: {
        // Node.js geliştirme ortamında self-signed sertifikaları kabul etmek için gerekli ayarlar
        rejectUnauthorized: false
    }
});
// Şifre sıfırlama isteği
router.post('/reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Kullanıcıyı veritabanında bul
        const user = await User.findOne({ $or: [{ email }, { email: email }] });
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        // Şifre sıfırlama talimatlarını e-posta ile gönder
        const resetLink = generateResetLink(user); // Şifre sıfırlama linki oluşturma işlevi
        await sendResetEmail(user.email, resetLink); // E-posta gönderme işlemi

        res.json({ success: true });
    } catch (error) {
        console.error('Şifre sıfırlama sırasında hata:', error);
        res.status(500).json({ error: 'Şifre sıfırlama sırasında bir hata oluştu' });
    }
});

// E-posta gönderme fonksiyonu
async function sendResetEmail(recipientEmail, resetLink) {
    try {
        // E-posta seçenekleri
        let mailOptions = {
            from: 'your-email@gmail.com', // Gönderici e-posta adresi
            to: recipientEmail, // Alıcı e-posta adresi
            subject: 'Şifre Sıfırlama Talimatları',
            html: `<p>Şifrenizi sıfırlamak için <a href="${resetLink}">buraya tıklayın</a>.</p>`
        };

        // E-posta gönderimi
        let info = await transporter.sendMail(mailOptions);
        console.log('E-posta gönderildi: %s', info.messageId);
    } catch (error) {
        console.error('E-posta gönderirken hata oluştu:', error);
        throw error; // Hata durumunda hatayı yeniden fırlat
    }
}

// Örnek şifre sıfırlama linki oluşturma işlevi
function generateResetLink(user) {
    // Burada güvenlik için token veya benzersiz bir link oluşturulabilir
    return `http://localhost:3000/reset-password/${user._id}`;
}
// Register route
router.post('/register', async (req, res) => {
    const { username, password, email, passwordAgain, phoneNumber } = req.body;

    if (password !== passwordAgain) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            phoneNumber
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ userId: savedUser._id }, jwtSecret, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user in database
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'User not found' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
