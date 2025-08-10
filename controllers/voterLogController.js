import VoterLog from "../models/VoterLog.js";
import Election from "../models/Election.js";

export const logVoterActivity = async ({ userId, electionId, status = "voted", ipAddress = "" }) => {
  try {
    const newLog = new VoterLog({
      userId,
      electionId,
      status,
      ipAddress,
    });

    await newLog.save();
    console.log("✅ Voter activity logged");

  } catch (error) {
    console.error("❌ Failed to log voter activity:", error.message);
  }
};

export const getVoterLogsByElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    if (String(election.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    
    const logs = await VoterLog.find({ electionId })
      .populate("userId", "name email") 
      .sort({ votedAt: -1 });

    res.status(200).json({ success: true, logs });

  } catch (error) {
    console.error("❌ Error in getVoterLogsByElection:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};