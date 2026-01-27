import User from "../models/User.js";
import Election from "../models/Election.js";
import ContactMessage from "../models/ContactMessage.js";

export const listUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -otp -otpExpiresAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("❌ Error in listUsers:", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = true;
    user.otp = "";
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({ success: true, message: "User verified", user });
  } catch (error) {
    console.error("❌ Error in verifyUser:", error);
    res.status(500).json({ message: "Server error while verifying user" });
  }
};

export const promoteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isAdmin = true;
    await user.save();

    res.status(200).json({ success: true, message: "User promoted to admin", user });
  } catch (error) {
    console.error("❌ Error in promoteUser:", error);
    res.status(500).json({ message: "Server error while promoting user" });
  }
};

export const listElections = async (req, res) => {
  try {
    const elections = await Election.find()
      .populate("createdBy", "name email")
      .populate("candidates")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, elections });
  } catch (error) {
    console.error("❌ Error in listElections:", error);
    res.status(500).json({ message: "Server error while fetching elections" });
  }
};

export const deleteElectionAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    await election.deleteOne();
    res.status(200).json({ success: true, message: "Election deleted" });
  } catch (error) {
    console.error("❌ Error in deleteElectionAdmin:", error);
    res.status(500).json({ message: "Server error while deleting election" });
  }
};

export const listContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("❌ Error in listContactMessages:", error);
    res.status(500).json({ message: "Server error while fetching contact messages" });
  }
};
