const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tmdb", require("./routes/tmdbRoutes"));
app.use("/api/tracking", require("./routes/trackingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/follows", require("./routes/followRoutes"));
app.use("/api/feed", require("./routes/feedRoutes"));
app.use("/api/lists", require("./routes/listRoutes"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});