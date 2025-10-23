import { v4 as uuidv4 } from "uuid";
import Joi from "joi";
import Appointment from "../models/Appointment.js";

// --------------------
// Logger
// --------------------
const logAction = (appointmentId, action, message) => {
  console.log(`[${new Date().toISOString()}] Appointment: ${appointmentId || "N/A"} | Action: ${action} | ${message}`);
};

// --------------------
// Validation Schemas
// --------------------
const createVideoRoomSchema = Joi.object({
  appointmentId: Joi.string().length(24).hex().required(),
});

// --------------------
// Create Video Room
// --------------------
export const createVideoRoom = async (req, res) => {
  try {
    const { error } = createVideoRoomSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { appointmentId } = req.body;

    // 1️⃣ Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      logAction(appointmentId, "CREATE_VIDEO_ROOM_FAIL", "Appointment not found");
      return res.status(404).json({ error: "Appointment not found" });
    }

    // 2️⃣ Create a unique room ID
    const roomId = `room-${uuidv4()}`;

    // 3️⃣ Update appointment with room ID
    appointment.videoRoomId = roomId;
    appointment.status = "ongoing"; // optional
    await appointment.save();

    logAction(appointmentId, "CREATE_VIDEO_ROOM_SUCCESS", `Video room created: ${roomId}`);
    res.status(201).json({
      message: "Video room created successfully",
      roomId,
    });
  } catch (error) {
    logAction(req.body.appointmentId || null, "CREATE_VIDEO_ROOM_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Video Room
// --------------------
export const getVideoRoom = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      logAction(appointmentId, "GET_VIDEO_ROOM_FAIL", "Appointment not found");
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (!appointment.videoRoomId) {
      logAction(appointmentId, "GET_VIDEO_ROOM_FAIL", "Video room not created yet");
      return res.status(400).json({ error: "Video room not created yet" });
    }

    logAction(appointmentId, "GET_VIDEO_ROOM_SUCCESS", `Fetched video room: ${appointment.videoRoomId}`);
    res.json({ roomId: appointment.videoRoomId });
  } catch (error) {
    logAction(req.params.appointmentId || null, "GET_VIDEO_ROOM_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};
