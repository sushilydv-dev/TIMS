import React, { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiPhone, FiMail, FiCheck, FiX, FiEye, FiFilter } from "react-icons/fi";
import axios from "axios";
import { Panel, PanelHeader, PrimaryButton, SecondaryButton, Toast } from "../DashboardUI";
import { inputClass } from "../dashboardTheme";

export const AppointmentRequests = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [toast, setToast] = useState("");

  const showToastMsg = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 4000);
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/appointments${filter !== "all" ? `?status=${filter}` : ""}`);
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      showToastMsg("Failed to load appointment requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(`/api/appointments/${id}/status`, { status: newStatus });
      showToastMsg(`Appointment ${newStatus.toLowerCase()}`);
      fetchAppointments();
      setShowDetails(false);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      showToastMsg("Failed to update appointment status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment request?")) return;
    
    try {
      await axios.delete(`/api/appointments/${id}`);
      showToastMsg("Appointment request deleted");
      fetchAppointments();
      setShowDetails(false);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      showToastMsg("Failed to delete appointment request");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const filteredAppointments = appointments.filter(
    (apt) => filter === "all" || apt.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading appointment requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast message={toast} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0c0407] tracking-tight">Appointment Requests</h2>
          <p className="text-xs text-[#636363]">Manage and respond to appointment requests from the homepage</p>
        </div>
        
        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs font-semibold border border-black/10 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#94a3b8]"
          >
            <option value="all">All Requests</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <Panel className="max-w-5xl mx-auto">
        <PanelHeader title="Appointment Requests" eyebrow={`Total: ${filteredAppointments.length}`} />

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No appointment requests found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border border-black/5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setShowDetails(true);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                    <span className="text-rose-600 font-bold text-sm">
                      {appointment.first_name[0]}{appointment.last_name[0]}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-[#0c0407]">
                      {appointment.first_name} {appointment.last_name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {formatDate(appointment.preferred_date)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {appointment.preferred_time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(appointment.status)}`}
                  >
                    {appointment.status}
                  </span>
                  <FiEye className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Appointment Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#0c0407]">Appointment Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                  <span className="text-rose-600 font-bold text-lg">
                    {selectedAppointment.first_name[0]}{selectedAppointment.last_name[0]}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-[#0c0407]">
                    {selectedAppointment.first_name} {selectedAppointment.last_name}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedAppointment.status)}`}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-semibold">Phone</p>
                  <p className="flex items-center gap-2 text-[#0c0407]">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    {selectedAppointment.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-semibold">Email</p>
                  <p className="flex items-center gap-2 text-[#0c0407]">
                    <FiMail className="w-4 h-4 text-gray-400" />
                    {selectedAppointment.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-semibold">Preferred Date</p>
                  <p className="flex items-center gap-2 text-[#0c0407]">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    {formatDate(selectedAppointment.preferred_date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-semibold">Preferred Time</p>
                  <p className="flex items-center gap-2 text-[#0c0407]">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    {selectedAppointment.preferred_time}
                  </p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-semibold">Notes</p>
                  <p className="text-sm text-[#0c0407] bg-gray-50 p-3 rounded-lg">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-3 font-semibold">Update Status</p>
                <div className="flex gap-2">
                  {selectedAppointment.status === "PENDING" && (
                    <>
                      <PrimaryButton
                        onClick={() => handleStatusUpdate(selectedAppointment.id, "CONFIRMED")}
                        className="flex items-center gap-2"
                      >
                        <FiCheck className="w-4 h-4" />
                        Confirm
                      </PrimaryButton>
                      <SecondaryButton
                        onClick={() => handleStatusUpdate(selectedAppointment.id, "CANCELLED")}
                        className="flex items-center gap-2"
                      >
                        <FiX className="w-4 h-4" />
                        Cancel
                      </SecondaryButton>
                    </>
                  )}
                  {selectedAppointment.status === "CONFIRMED" && (
                    <PrimaryButton
                      onClick={() => handleStatusUpdate(selectedAppointment.id, "COMPLETED")}
                      className="flex items-center gap-2"
                    >
                      <FiCheck className="w-4 h-4" />
                      Mark Complete
                    </PrimaryButton>
                  )}
                  <SecondaryButton
                    onClick={() => handleDelete(selectedAppointment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </SecondaryButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentRequests;
