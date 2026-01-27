import Candidate from "../models/Candidate.js";
import Election from "../models/Election.js";

export const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    const candidates = await Candidate.find({ electionId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });

  } catch (error) {
    console.error("❌ Error in getCandidatesByElection:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createCandidate = async (req, res) => {
  try {
    const { name, bio, electionId } = req.body;

    
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    if (election.isActive === false || (election.endDate && new Date(election.endDate) <= new Date())) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add candidates after the election has ended'
      });
    }

    
    const newCandidate = new Candidate({
      name,
      bio,
      electionId
    });

    const savedCandidate = await newCandidate.save();

    
    election.candidates.push(savedCandidate._id);
    await election.save();

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      candidate: savedCandidate
    });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating candidate'
    });
  }
};
