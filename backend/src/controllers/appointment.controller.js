import AppointmentRequest from "../models/appointmentRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendNewAppointmentRequest } from "../services/notification.service.js";

// Create appointment request
export const createAppointmentRequest = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, email, preferredTime, preferredDate } = req.body;

  const appointment = await AppointmentRequest.create({
    first_name: firstName,
    last_name: lastName,
    phone,
    email,
    preferred_time: preferredTime,
    preferred_date: preferredDate,
    status: "PENDING",
  });

  try {
    const clientName = `${firstName} ${lastName}`;
    await sendNewAppointmentRequest(appointment.id, clientName, preferredDate);
  } catch (error) {
    console.error("Failed to send appointment request notification:", error);
  }

  res.status(201).json({
    message: "Appointment request submitted successfully",
    appointment,
  });
});

// Get all appointment requests (admin only)
export const getAllAppointmentRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const whereClause = {};
  if (status) {
    whereClause.status = status;
  }

  const appointments = await AppointmentRequest.findAll({
    where: whereClause,
    order: [["created_at", "DESC"]],
  });

  res.json(appointments);
});

// Update appointment request status
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const appointment = await AppointmentRequest.findByPk(id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment request not found");
  }

  await appointment.update({
    status,
    notes: notes || appointment.notes,
  });

  res.json({
    message: "Appointment status updated successfully",
    appointment,
  });
});

// Delete appointment request
export const deleteAppointmentRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await AppointmentRequest.findByPk(id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment request not found");
  }

  await appointment.destroy();

  res.json({
    message: "Appointment request deleted successfully",
  });
});
