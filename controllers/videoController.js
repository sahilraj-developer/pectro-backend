import { v4 as uuidv4 } from "uuid";
import Appointment from "../models/Appointment.js";

/**
 * ✅ Generate a video room for an appointment
 * This is a mock implementation.
 * Later, integrate with Twilio / WebRTC server.
 */
export const createVideoRoom = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // 1️⃣ Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    // 2️⃣ Create a unique room ID
    const roomId = `room-${uuidv4()}`;

    // 3️⃣ Update appointment with room ID
    appointment.videoRoomId = roomId;
    appointment.status = "ongoing"; // optional: mark as ongoing
    await appointment.save();

    res.json({
      message: "Video room created successfully",
      roomId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get video room for an appointment
 */
export const getVideoRoom = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    if (!appointment.videoRoomId)
      return res.status(400).json({ error: "Video room not created yet" });

    res.json({ roomId: appointment.videoRoomId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
