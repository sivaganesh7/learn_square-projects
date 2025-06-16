const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));

// Serve static files from the React app (build folder)
app.use(express.static(path.join(__dirname, "build")));

// Handle SPA routing: return index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1); // Exit the process if MongoDB connection fails
  });

const PORT = process.env.PORT || 5001;

// Start the server with error handling for EADDRINUSE
const server = app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Please free the port or use a different one.`
      );
      console.error(
        "To find the process using the port, run: netstat -aon | findstr :5000"
      );
      console.error("To kill the process, run: taskkill /PID <PID> /F");
      process.exit(1);
    } else {
      console.error("Server error:", err.message);
      process.exit(1);
    }
  });

// Handle process termination gracefully
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    mongoose.connection.close(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });
});
