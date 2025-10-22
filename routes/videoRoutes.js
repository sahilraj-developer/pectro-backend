import express from "express";
import { createVideoRoom, getVideoRoom } from "../controllers/videoController.js";

const router = express.Router();

// Create video room for an appointment
router.post("/create", createVideoRoom);

// Get video room by appointment
router.get("/:appointmentId", getVideoRoom);

export default router;
