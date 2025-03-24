// chatRoutes.js
import express from "express";
import {
    createNewChat,
    userChats,
    chat,
    updateChat
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/chats", createNewChat);
router.get("/userChats", userChats);
router.get("/chats/:id", chat);
router.put("/chats/:id", updateChat);

export default router;