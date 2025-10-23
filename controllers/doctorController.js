import Doctor from "../models/Doctor.js";
import Joi from "joi";

// --------------------
// Logger
// --------------------
const logAction = (userId, action, message) => {
  console.log(
    `[${new Date().toISOString()}] User: ${userId || "N/A"} | Action: ${action} | ${message}`
  );
};

// --------------------
// Validation Schemas
// --------------------
const availableSlotSchema = Joi.object({
  day: Joi.string()
    .valid("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
    .required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
});

const doctorSchema = Joi.object({
  userId: Joi.string().length(24).hex().required(),
  name: Joi.string().min(3).max(50).required(),
  specialization: Joi.string().min(2).max(100).required(),
  qualification: Joi.string().allow("", null),
  experienceYears: Joi.number().min(0),
  bio: Joi.string().allow("", null),
  consultationFee: Joi.number().min(0).default(0),
  availableSlots: Joi.array().items(availableSlotSchema),
  rating: Joi.number().min(0).max(5).default(0),
  verified: Joi.boolean().default(false),
});

// Optional fields for update
const updateDoctorSchema = Joi.object({
  userId: Joi.string().length(24).hex(),
  name: Joi.string().min(3).max(50),
  specialization: Joi.string().min(2).max(100),
  qualification: Joi.string().allow("", null),
  experienceYears: Joi.number().min(0),
  bio: Joi.string().allow("", null),
  consultationFee: Joi.number().min(0),
  availableSlots: Joi.array().items(availableSlotSchema),
  rating: Joi.number().min(0).max(5),
  verified: Joi.boolean(),
});


// --------------------
// Create Doctor
// --------------------
export const createDoctor = async (req, res) => {
  try {
    const { error } = doctorSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const doctor = await Doctor.create(req.body);
    logAction(req.body.userId, "CREATE_DOCTOR", `Doctor created with ID ${doctor._id}`);

    res.status(201).json(doctor);
  } catch (error) {
    logAction(req.body.userId, "CREATE_DOCTOR_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get All Doctors
// --------------------
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("userId", "name email");
    logAction(null, "FETCH_DOCTORS", "Fetched all doctors");
    res.json(doctors);
  } catch (error) {
    logAction(null, "FETCH_DOCTORS_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Doctor by ID
// --------------------
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("userId", "name email");
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    logAction(doctor.userId, "FETCH_DOCTOR", `Fetched doctor ${doctor._id}`);
    res.json(doctor);
  } catch (error) {
    logAction(null, "FETCH_DOCTOR_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Update Doctor
// --------------------
export const updateDoctor = async (req, res) => {
  try {
    const { error } = updateDoctorSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    logAction(req.body.userId || null, "UPDATE_DOCTOR", `Updated doctor ${doctor._id}`);
    res.json(doctor);
  } catch (error) {
    logAction(req.body.userId || null, "UPDATE_DOCTOR_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Delete Doctor
// --------------------
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    logAction(doctor.userId, "DELETE_DOCTOR", `Deleted doctor ${doctor._id}`);
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    logAction(null, "DELETE_DOCTOR_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};
