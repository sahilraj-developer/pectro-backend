import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Joi from "joi";

// --------------------
// Logger
// --------------------
const logAction = (userId, action, message) => {
  console.log(`[${new Date().toISOString()}] User: ${userId || "N/A"} | Action: ${action} | ${message}`);
};

// --------------------
// Validation Schemas
// --------------------
const createAppointmentSchema = Joi.object({
  doctorId: Joi.string().length(24).hex().required(),
  userId: Joi.string().length(24).hex().required(),
  scheduleTime: Joi.date().required(),
  mode: Joi.string().valid("video", "in_person").default("video"),
  status: Joi.string().valid("scheduled", "ongoing", "completed", "cancelled").default("scheduled"),
  paymentId: Joi.string().length(24).hex().optional(),
  videoRoomId: Joi.string().optional(),
  notes: Joi.string().optional(),
});

const updateAppointmentSchema = Joi.object({
  doctorId: Joi.string().length(24).hex(),
  userId: Joi.string().length(24).hex(),
  scheduleTime: Joi.date(),
  mode: Joi.string().valid("video", "in_person"),
  status: Joi.string().valid("scheduled", "ongoing", "completed", "cancelled"),
  paymentId: Joi.string().length(24).hex(),
  videoRoomId: Joi.string(),
  notes: Joi.string(),
});


// --------------------
// Create Appointment
// --------------------
export const createAppointment = async (req, res) => {
  try {
    const { error } = createAppointmentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { doctorId, userId, scheduleTime } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      logAction(userId, "CREATE_APPOINTMENT_FAIL", "Doctor not found");
      return res.status(404).json({ error: "Doctor not found" });
    }

    const existing = await Appointment.findOne({ doctorId, scheduleTime });
    if (existing) {
      logAction(userId, "CREATE_APPOINTMENT_FAIL", "Time slot already booked");
      return res.status(400).json({ error: "This time slot is already booked for the doctor" });
    }

    const appointment = await Appointment.create(req.body);
    logAction(userId, "CREATE_APPOINTMENT", `Appointment created with ID ${appointment._id}`);

    res.status(201).json(appointment);
  } catch (error) {
    logAction(req.body.userId, "CREATE_APPOINTMENT_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get All Appointments
// --------------------
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctorId", "name specialization consultationFee")
      .populate("userId", "name email");
    logAction(null, "FETCH_APPOINTMENTS", `Fetched all appointments`);
    res.json(appointments);
  } catch (error) {
    logAction(null, "FETCH_APPOINTMENTS_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Appointment by ID
// --------------------
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId", "specialization consultationFee")
      .populate("userId", "name email");
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    logAction(appointment.userId, "FETCH_APPOINTMENT", `Fetched appointment ${appointment._id}`);
    res.json(appointment);
  } catch (error) {
    logAction(null, "FETCH_APPOINTMENT_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Update Appointment
// --------------------
export const updateAppointment = async (req, res) => {
  try {
    const { error } = updateAppointmentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    logAction(req.body.userId, "UPDATE_APPOINTMENT", `Updated appointment ${appointment._id}`);
    res.json(appointment);
  } catch (error) {
    logAction(req.body.userId, "UPDATE_APPOINTMENT_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Delete Appointment
// --------------------
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    logAction(appointment.userId, "DELETE_APPOINTMENT", `Deleted appointment ${appointment._id}`);
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    logAction(null, "DELETE_APPOINTMENT_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Appointments by Doctor
// --------------------
export const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId })
      .populate("userId", "name email")
      .sort({ scheduleTime: 1 });

    logAction(null, "FETCH_DOCTOR_APPOINTMENTS", `Fetched appointments for doctor ${doctorId}`);
    res.json(appointments);
  } catch (error) {
    logAction(null, "FETCH_DOCTOR_APPOINTMENTS_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Appointments by User
// --------------------
export const getAppointmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await Appointment.find({ userId })
      .populate("doctorId", "specialization consultationFee")
      .sort({ scheduleTime: -1 });

    logAction(userId, "FETCH_USER_APPOINTMENTS", `Fetched appointments for user ${userId}`);
    res.json(appointments);
  } catch (error) {
    logAction(userId, "FETCH_USER_APPOINTMENTS_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};
