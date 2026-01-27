import User from "../models/User.js";
import Election from "../models/Election.js";
import ContactMessage from "../models/ContactMessage.js";

export const listUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const search = (req.query.search || "").trim();

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password -otp -otpExpiresAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      users,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
      total,
    });
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

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user?.id?.toString() === id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("❌ Error in deleteUser:", error);
    res.status(500).json({ message: "Server error while deleting user" });
  }
};

export const listElections = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const search = (req.query.search || "").trim();

    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await Election.countDocuments(filter);
    const elections = await Election.find(filter)
      .populate("createdBy", "name email")
      .populate("candidates")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      elections,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
      total,
    });
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
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const search = (req.query.search || "").trim();

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { message: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await ContactMessage.countDocuments(filter);
    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      messages,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
      total,
    });
  } catch (error) {
    console.error("❌ Error in listContactMessages:", error);
    res.status(500).json({ message: "Server error while fetching contact messages" });
  }
};

export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findById(id);
    if (!message) return res.status(404).json({ message: "Contact message not found" });

    await message.deleteOne();
    res.status(200).json({ success: true, message: "Contact message deleted" });
  } catch (error) {
    console.error("❌ Error in deleteContactMessage:", error);
    res.status(500).json({ message: "Server error while deleting contact message" });
  }
};
