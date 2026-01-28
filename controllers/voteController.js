import Vote from "../models/Vote.js";
import Election from "../models/Election.js";
import Candidate from "../models/Candidate.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { getIO } from "../socket.js";



export const castVote = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("🧾 Incoming vote request:", req.body);
    const { electionId, candidateId, votePassword } = req.body;
    if (!electionId || !candidateId) {
  return res.status(400).json({ message: 'Missing electionId or candidateId' });
}
    console.log('Casting vote:', { userId, electionId, candidateId });

    const election = await Election.findById(electionId).select("+votePasswordHash");

    console.log('Election found:', election);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (!election.isActive || new Date() > election.endDate) {
      return res.status(400).json({ message: 'Election is not active' });
    }
    const allowedEmails = election.allowedEmails || [];
    const allowedDomains = election.allowedEmailDomains || [];
    const hasRestrictions = allowedEmails.length > 0 || allowedDomains.length > 0;

    if (hasRestrictions) {
      const voterEmail = (req.user?.email || "").trim().toLowerCase();
      const voterDomain = voterEmail.includes("@") ? voterEmail.slice(voterEmail.lastIndexOf("@")) : "";
      const isAllowed = allowedEmails.includes(voterEmail) || (voterDomain && allowedDomains.includes(voterDomain));
      if (!isAllowed) {
        return res.status(403).json({ message: 'Your email is not allowed to vote in this election' });
      }
    } else if (election.isPasswordProtected) {
      if (!votePassword) {
        return res.status(401).json({ message: 'Election password is required' });
      }
      const isMatch = await bcrypt.compare(votePassword, election.votePasswordHash || "");
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid election password' });
      }
    }

    const isCandidateValid = election.candidates.includes(candidateId);
    console.log('Is candidate valid:', isCandidateValid);
    if (!isCandidateValid) {
      return res.status(400).json({ message: 'Invalid candidate for this election' });
    }
    const candidate = await Candidate.findById(candidateId);
    console.log('Candidate found:', candidate);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    console.log('Candidate vote count updated:', candidate.voteCount);
    const alreadyVoted = await Vote.findOne({ voterId: userId, electionId });
    console.log('Already voted:', alreadyVoted);
    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    candidate.voteCount += 1;
    await candidate.save();

    const voter = election.voters.push(userId);
    await election.save();

    const vote = new Vote({
      voterId: userId,
      electionId,
      candidateId
    });

    await vote.save();

    try {
      const io = getIO();
      io.to(`election:${electionId}`).emit("vote-updated", {
        electionId,
        candidateId,
        voteCount: candidate.voteCount,
        totalVotes: election.voters.length,
        voterName: req.user?.name || "Someone",
        votedAt: new Date().toISOString()
      });
    } catch (emitError) {
      console.error("Socket emit failed:", emitError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Vote casted successfully',
      voteId: vote._id,
      voteCount: candidate.voteCount
    });

  } catch (error) {
    console.error('❌ Error in castVote:', error);
    res.status(500).json({ message: 'Server error while casting vote' });
  }
};

export const getVotesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    console.log('Fetching votes for election:', electionId);
    const userId = req.user.id;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    
    if (election.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only election creator can view votes' });
    }

    const votes = await Vote.find({ electionId })
      .populate('voterId', 'name email')
      .populate('candidateId', 'name party');

    res.status(200).json({
      success: true,
      totalVotes: votes.length,
      votes,
    });

  } catch (error) {
    console.error('❌ Error in getVotesByElection:', error);
    res.status(500).json({ message: 'Server error while fetching votes' });
  }
};
