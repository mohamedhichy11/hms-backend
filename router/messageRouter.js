import express from 'express';
import { getAllMessages, sendMessage, getTopRatedMessages } from '../controller/messageController.js';
import { isAdminAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.post("/send", sendMessage);
router.get("/getall", isAdminAuthenticated, getAllMessages);
router.get("/toprated", getTopRatedMessages); 

export default router;
