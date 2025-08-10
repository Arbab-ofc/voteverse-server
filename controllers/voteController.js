import Vote from "../models/Vote.js";
import Election from "../models/Election.js";
import Candidate from "../models/Candidate.js";
import User from "../models/User.js";



export const castVote = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("🧾 Incoming vote request:", req.body);
    const { electionId, candidateId } = req.body;
    if (!electionId || !candidateId) {
  return res.status(400).json({ message: 'Missing electionId or candidateId' });
}
    console.log('Casting vote:', { userId, electionId, candidateId });

    const election = await Election.findById(electionId);

    console.log('Election found:', election);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (!election.isActive || new Date() > election.endDate) {
      return res.status(400).json({ message: 'Election is not active' });
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

    return res.status(201).json({
      success: true,
      message: 'Vote casted successfully',
      voteId: vote._id
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

