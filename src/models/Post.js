const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        max: 500  // En fazla 500 karakter
    },
    img: {
        type: String
    },
    likes: {
        type: Array,
        default: []  // Varsayılan olarak boş bir dizi
    }
}, {
    timestamps: true  // Bu seçenek createdAt ve updatedAt alanlarını otomatik olarak ekler
});

module.exports = mongoose.model("Post", postSchema);
