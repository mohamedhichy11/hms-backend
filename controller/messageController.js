import { Message } from "../models/messageSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, message, rating } = req.body;
  if (!firstName || !lastName || !email || !phone || !message || !rating) {
    return next(new ErrorHandler("Please fill out the entire form!", 400));
  }

  await Message.create({ firstName, lastName, email, phone, message, rating });
  res.status(200).json({
    success: true,
    message: "Message Sent!",
  });
});

export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
  const messages = await Message.find();
  res.status(200).json({
    success: true,
    messages,
  });
});

export const getTopRatedMessages = catchAsyncErrors(async (req, res, next) => {
  const topMessages = await Message.findTopRated(3);
  res.status(200).json({
    success: true,
    topMessages,
  });
});
