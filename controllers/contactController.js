import ContactMessage from "../models/ContactMessage.js";

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newMessage = await ContactMessage.create({
      name,
      email,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("❌ Error in submitContactMessage:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};