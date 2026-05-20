import { supabase } from "../database/dbConnection.js";

const mapMessage = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    rating: row.rating,
    createdAt: row.created_at,
  };
};

export const Message = {
  create: async (data) => {
    const { data: created, error } = await supabase
      .from("messages")
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        message: data.message,
        rating: data.rating || 0,
      })
      .select("*")
      .single();

    if (error) throw error;
    return mapMessage(created);
  },

  find: async () => {
    const { data, error } = await supabase.from("messages").select("*");
    if (error) throw error;
    return (data || []).map(mapMessage);
  },

  // Returns top N messages sorted by rating descending
  findTopRated: async (limit = 3) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("rating", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(mapMessage);
  },
};
