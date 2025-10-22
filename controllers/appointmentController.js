import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

/**
 * ✅ Create new appointment
 */
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, userId, scheduleTime } = req.body;

    // 1️⃣ Validate doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    // 2️⃣ Prevent double booking
    const existing = await Appointment.findOne({ doctorId, scheduleTime });
    if (existing)
      return res
        .status(400)
        .json({ error: "This time slot is already booked for the doctor" });

    // 3️⃣ Create appointment
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * ✅ Get all appointments
 */
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctorId", "specialization consultationFee")
      .populate("userId", "name email");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get single appointment
 */
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId", "specialization consultationFee")
      .populate("userId", "name email");
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Update appointment
 */
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * ✅ Delete appointment
 */
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get all appointments for a specific doctor
 */
export const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId })
      .populate("userId", "name email")
      .sort({ scheduleTime: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get all appointments for a specific user
 */
export const getAppointmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await Appointment.find({ userId })
      .populate("doctorId", "specialization consultationFee")
      .sort({ scheduleTime: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
