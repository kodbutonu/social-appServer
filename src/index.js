const express = require('express');
const authRoutes = require('./routes/auth.js');
const db = require("./config/index.js");
var cors = require('cors')

const app = express();


app.use(express.json());

db();

app.use(cors())
app.use(express.urlencoded({ extended: false }))
// Routes
app.use('/api/auth', authRoutes);


// Server başlatma
app.listen(8000, () => {
    console.log(`Server is running on port}`);
});
