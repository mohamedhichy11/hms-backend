import { supabase } from "../database/dbConnection.js";

const mapAppointment = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    nic: row.nic,
    dob: row.dob,
    gender: row.gender,
    appointment_date: row.appointment_date,
    department: row.department,
    doctor: {
      firstName: row.doctor_first_name,
      lastName: row.doctor_last_name,
    },
    hasVisited: row.has_visited,
    address: row.address,
    doctorId: row.doctor_id,
    patientId: row.patient_id,
    status: row.status,
    createdAt: row.created_at,
    // Instance method
    deleteOne: async () => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", row.id);
      if (error) throw error;
    },
  };
};

export const Appointment = {
  create: async (data) => {
    const { data: created, error } = await supabase
      .from("appointments")
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        nic: data.nic,
        dob: data.dob,
        gender: data.gender,
        appointment_date: data.appointment_date,
        department: data.department,
        doctor_first_name: data.doctor.firstName,
        doctor_last_name: data.doctor.lastName,
        has_visited: data.hasVisited || false,
        address: data.address,
        doctor_id: data.doctorId,
        patient_id: data.patientId,
        status: data.status || "Pending",
      })
      .select("*")
      .single();

    if (error) throw error;
    return mapAppointment(created);
  },

  find: async (filter = {}) => {
    let query = supabase.from("appointments").select("*");
    // Add filters as needed
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapAppointment);
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return mapAppointment(data);
  },

  findByIdAndUpdate: async (id, updateData) => {
    const patch = {};
    if (updateData.status !== undefined) patch.status = updateData.status;
    if (updateData.hasVisited !== undefined) patch.has_visited = updateData.hasVisited;
    if (updateData.firstName !== undefined) patch.first_name = updateData.firstName;
    if (updateData.lastName !== undefined) patch.last_name = updateData.lastName;

    const { data, error } = await supabase
      .from("appointments")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapAppointment(data);
  },
};
