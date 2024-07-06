const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // JWT kütüphanesi
const User = require('../models/User');
const jwtSecret = process.env.JWT_SECRET ||'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'oergin526@gmail.com',
        pass: 'dawy fyyl xesk seno'
    },
    tls: {
        rejectUnauthorized: false
    }
});

function generateResetCode() {
    const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return resetCode;
}

router.post('/reset-password-request', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        user.resetToken = resetToken;
        await user.save();

        await sendResetEmail(user.email, resetToken);

        res.json({ success: true });
    } catch (error) {
        console.error('Şifre sıfırlama sırasında hata:', error);
        res.status(500).json({ error: 'Şifre sıfırlama sırasında bir hata oluştu' });
    }
});

async function sendResetEmail(recipientEmail, resetToken) {
    try {
        let mailOptions = {
            from: 'oergin526@gmail.com',
            to: recipientEmail,
            subject: 'Şifre Sıfırlama',
            text: `Şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanın: http://localhost:3000/reset-password/${resetToken}`
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('E-posta gönderildi: %s', info.messageId);
    } catch (error) {
        console.error('E-posta gönderirken hata oluştu:', error);
        throw error;
    }
}

router.post('/reset-password', async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetToken = '';
        await user.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Şifre yenileme sırasında hata:', error);
        res.status(500).json({ error: 'Şifre yenileme sırasında bir hata oluştu' });
    }
});


router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Kullanıcı adı zaten var' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        const token = generateToken(newUser);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Kullanıcı oluşturulurken bir hata oluştu' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Kullanıcı bulunamadı' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Geçersiz kimlik bilgileri' });
        }

        const token = generateToken(user);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Giriş yapılırken bir hata oluştu' });
    }
});

module.exports = router;
