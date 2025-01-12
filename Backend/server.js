require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv=require("dotenv")

dotenv.config();
const app = express();

// Middleware
app.use(cors());
const corsOptions={
  origin: process.env.Frontend_URL,
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
// app.use(cors({
//     origin: 'http://localhost:3000' 
//   }));

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const recipeRoutes = require('./routes/recipeRoutes');
const postRoutes = require("./routes/postroutes");
const streamRoutes = require("./routes/streamingRoutes");
const ratingRoutes = require('./routes/ratingroutes');

app.use('/api', recipeRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/streams", streamRoutes);
app.use('/api', ratingRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});