import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../database/dbConnection.js";

// Helper: map snake_case DB row → camelCase user object
const mapUser = (row) => {
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
    password: row.password,
    role: row.role,
    doctorDepartment: row.doctor_department,
    docAvatar: {
      public_id: row.doc_avatar_public_id,
      url: row.doc_avatar_url,
    },
    createdAt: row.created_at,
    // Attach instance methods
    comparePassword: async (enteredPassword) =>
      bcrypt.compare(enteredPassword, row.password),
    generateJsonWebToken: () =>
      jwt.sign({ id: row.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
      }),
  };
};

export const User = {
  // Find one user by filter object
  findOne: async (filter, opts = {}) => {
    let query = supabase.from("users").select("*");

    if (filter.email) query = query.eq("email", filter.email);
    if (filter.role) query = query.eq("role", filter.role);
    if (filter.id || filter._id) query = query.eq("id", filter.id || filter._id);
    if (filter.firstName) query = query.eq("first_name", filter.firstName);
    if (filter.lastName) query = query.eq("last_name", filter.lastName);

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return mapUser(data);
  },

  // Find by primary key
  findById: async (id) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return mapUser(data);
  },

  // Find many users by filter
  find: async (filter = {}) => {
    let query = supabase.from("users").select("*");

    if (filter.role) query = query.eq("role", filter.role);
    if (filter.firstName) query = query.eq("first_name", filter.firstName);
    if (filter.lastName) query = query.eq("last_name", filter.lastName);
    if (filter.doctorDepartment) query = query.eq("doctor_department", filter.doctorDepartment);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapUser);
  },

  // Create a new user (hashes password automatically)
  create: async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        nic: userData.nic,
        dob: userData.dob,
        gender: userData.gender,
        password: hashedPassword,
        role: userData.role,
        doctor_department: userData.doctorDepartment || null,
        doc_avatar_public_id: userData.docAvatar?.public_id || null,
        doc_avatar_url: userData.docAvatar?.url || null,
      })
      .select("*")
      .single();

    if (error) throw error;
    return mapUser(data);
  },

  // Delete one user by filter
  findOneAndDelete: async (filter) => {
    let query = supabase.from("users").select("*");

    if (filter._id) query = query.eq("id", filter._id);
    if (filter.role) query = query.eq("role", filter.role);

    const { data: found, error: findErr } = await query.maybeSingle();
    if (findErr) throw findErr;
    if (!found) return null;

    const { error: delErr } = await supabase
      .from("users")
      .delete()
      .eq("id", found.id);
    if (delErr) throw delErr;

    return mapUser(found);
  },
};
