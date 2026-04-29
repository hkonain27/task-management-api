import express from "express";
import {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createComment);
router.get("/", authenticateToken, getComments);
router.get("/:id", authenticateToken, getCommentById);
router.put("/:id", authenticateToken, updateComment);
router.delete("/:id", authenticateToken, deleteComment);

export default router;