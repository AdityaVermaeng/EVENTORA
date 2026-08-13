const express = require("express");
const dotenv = require('dotenv');
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");





dotenv.config();



const app= express();
app.use(cors());

//Routes
app.use("/api/auth", authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
});