// server.js
import express from "express";
import ImageKit from "imagekit";
import dotenv from "dotenv";
import cors from "cors"
import { createWebSocketServer } from "./controllers/websocket.js";
import chatRoutes from "./routes/chatRoutes.js";
import connectDB from "./config/db.js"
import { requireAuth } from '@clerk/express'

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

// Enable CORS *before* any other middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

app.use(express.json());

// Validate ImageKit environment variables and initialize conditionally
const requiredImageKitKeys = [
  "IMAGE_KIT_ENDPOINT",
  "IMAGE_KIT_PUBLIC_KEY",
  "IMAGE_KIT_PRIVATE_KEY",
];

const missingImageKitKeys = requiredImageKitKeys.filter(k => !process.env[k]);

let imagekit = null;

if (missingImageKitKeys.length > 0) {
  console.warn(
    `ImageKit is not configured. Missing environment variables: ${missingImageKitKeys.join(", ")}`
  );
} else {
  imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY
  });
}

app.get("/api/upload", (req, res) => {
    if (!imagekit) {
      return res.status(503).json({
        message: "ImageKit not configured on server. Set IMAGE_KIT_ENDPOINT, IMAGE_KIT_PUBLIC_KEY and IMAGE_KIT_PRIVATE_KEY."
      });
    }
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
});

app.use("/api", requireAuth(), chatRoutes);

// server.js
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err); // Log the error stack trace
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

connectDB()

const server = app.listen(port, () => {
    console.log(`Connected to API on port ${port}`);
});

createWebSocketServer(server)
