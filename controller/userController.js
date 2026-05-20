import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } = req.body;
  if (!firstName || !lastName || !email || !phone || !nic || !dob || !gender || !password) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already Registered!", 400));
  }

  user = await User.create({ firstName, lastName, email, phone, nic, dob, gender, password, role: "Patient" });
  generateToken(user, "User Registered!", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body;
  if (!email || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password & Confirm Password Do Not Match!", 400));
  }

  // Fetch user with password (all fields included in Supabase)
  const { data, error } = await (await import("../database/dbConnection.js")).supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!data) return next(new ErrorHandler("Invalid Email Or Password!", 400));

  const bcrypt = (await import("bcrypt")).default;
  const isPasswordMatch = await bcrypt.compare(password, data.password);
  if (!isPasswordMatch) return next(new ErrorHandler("Invalid Email Or Password!", 400));

  if (role !== data.role) {
    return next(new ErrorHandler("User Not Found With This Role!", 400));
  }

  const jwt = (await import("jsonwebtoken")).default;
  const userObj = {
    _id: data.id,
    id: data.id,
    role: data.role,
    generateJsonWebToken: () =>
      jwt.sign({ id: data.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
      }),
  };

  generateToken(userObj, "User Login Successfuly!", 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } = req.body;
  if (!firstName || !lastName || !email || !phone || !nic || !dob || !gender || !password) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler(`${isRegistered.role} With This Email Already Exists!`, 400));
  }

  const admin = await User.create({ firstName, lastName, email, phone, nic, dob, gender, password, role: "Admin" });
  res.status(200).json({ success: true, message: "New Admin Registered", admin });
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({ success: true, doctors });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({ success: true, user });
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res.status(201).cookie("adminToken", "", { httpOnly: true, expires: new Date(Date.now()) })
    .json({ success: true, message: "Admin Logged Out Successfully." });
});

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res.status(201).cookie("patientToken", "", { httpOnly: true, expires: new Date(Date.now()) })
    .json({ success: true, message: "Patient Logged Out Successfully." });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }
  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }

  const { firstName, lastName, email, phone, nic, dob, gender, password, doctorDepartment } = req.body;
  if (!firstName || !lastName || !email || !phone || !nic || !dob || !gender || !password || !doctorDepartment) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("Doctor With This Email Already Exists!", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    return next(new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500));
  }

  const doctor = await User.create({
    firstName, lastName, email, phone, nic, dob, gender, password,
    role: "Doctor", doctorDepartment,
    docAvatar: { public_id: cloudinaryResponse.public_id, url: cloudinaryResponse.secure_url },
  });

  res.status(200).json({ success: true, message: "New Doctor Registered", doctor });
});

export const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const deletedDoctor = await User.findOneAndDelete({ _id: doctorId, role: "Doctor" });
    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json({ message: "Doctor deleted successfully", deletedDoctor });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
