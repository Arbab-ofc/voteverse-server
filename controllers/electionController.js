import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';
import Vote from '../models/Vote.js';
import bcrypt from 'bcryptjs';

import mongoose from 'mongoose';

export const createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, votePassword } = req.body;

    const createdBy = req.user.id;
    if (!votePassword) {
      return res.status(400).json({ message: 'Election password is required' });
    }
    const votePasswordHash = await bcrypt.hash(votePassword, 10);

    const newElection = new Election({
      title,
      description,
      startDate,
      endDate,
      createdBy,
      votePasswordHash,
      isPasswordProtected: true
    });

    const savedElection = await newElection.save();

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      election: savedElection
    });
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating election'
    });
  }
};


export const getAllElections = async (req, res) => {
  try {
    const elections = await Election.find()
      .populate('createdBy', 'name email') 
      .populate('candidates'); 

    res.status(200).json({
      success: true,
      count: elections.length,
      elections,
    });
  } catch (error) {
    console.error('❌ Error in getAllElections:', error);
    res.status(500).json({ message: 'Server error while fetching elections' });
  }
};

export const getElectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const election = await Election.findById(id)
      .populate('createdBy', 'name email')          
      .populate('candidates' , 'name bio voteCount');                      

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found',
      });
    }

    res.status(200).json({
      success: true,
      election,
    });

  } catch (error) {
    console.error('❌ Error in getElectionById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching election',
    });
  }
};

export const updateElection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, candidates, votePassword } = req.body;

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this election' });
    }

    if (candidates && Array.isArray(candidates)) {
      const validCandidates = [];

      for (const candidateId of candidates) {
        if (!mongoose.Types.ObjectId.isValid(candidateId)) {
          return res.status(400).json({ message: `Invalid candidate ID: ${candidateId}` });
        }

        const exists = await Candidate.findById(candidateId);
        if (!exists) {
          return res.status(404).json({ message: `Candidate not found: ${candidateId}` });
        }

        validCandidates.push(candidateId);
      }

      election.candidates = validCandidates;
    }

    if (title) election.title = title;
    if (description) election.description = description;
    if (startDate) election.startDate = startDate;
    if (endDate) election.endDate = endDate;
    if (votePassword) {
      election.votePasswordHash = await bcrypt.hash(votePassword, 10);
      election.isPasswordProtected = true;
    }

    await election.save();

    res.status(200).json({
      success: true,
      message: 'Election updated successfully',
      election,
    });

  } catch (error) {
    console.error('❌ Error in updateElection:', error);
    res.status(500).json({ message: 'Server error while updating election' });
  }
};

export const deleteElection = async (req, res) => {
  try {
    const { id } = req.params;

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this election' });
    }

    await election.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Election deleted successfully',
    });

  } catch (error) {
    console.error('❌ Error in deleteElection:', error);
    res.status(500).json({ message: 'Server error while deleting election' });
  }
};

export const getMyElections = async (req, res) => {
  try {
    const myElections = await Election.find({ createdBy: req.user.id })
      .populate('createdBy', 'name email')
      .populate('candidates') 
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      count: myElections.length,
      elections: myElections,
    });

  } catch (error) {
    console.error('❌ Error in getMyElections:', error);
    res.status(500).json({ message: 'Server error while fetching your elections' });
  }
};

export const getElectionResult = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching result for election ID:Hello', id);

    const election = await Election.findById(id).populate('candidates');
    console.log('Election found:', election);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const now = new Date();
    if (election.endDate > now) {
      return res.status(400).json({ message: 'Election has not ended yet' });
    }

    const votes = await Vote.find({ electionId: id });
    console.log('Votes found:', votes.length);
    const voteCounts = {};

    for (const vote of votes) {
      const cid = vote.candidateId.toString();
      voteCounts[cid] = (voteCounts[cid] || 0) + 1;
    }

    const sorted = election.candidates
      .map((candidate) => ({
        candidate,
        votes: voteCounts[candidate._id.toString()] || 0
      }))
      .sort((a, b) => b.votes - a.votes);

    const winner = sorted.length ? sorted[0] : null;

    res.status(200).json({
      success: true,
      election,
      totalVotes: votes.length,
      result: sorted,
      winner,
    });

  } catch (error) {
    console.error('❌ Error in getElectionResult:', error);
    res.status(500).json({ message: 'Server error while fetching election results' });
  }
};

export const endElection = async (req, res) => {
  try {
    const { id } = req.params;

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to end this election' });
    }

    if (!election.isActive) {
      return res.status(400).json({ message: 'Election is already ended' });
    }

    election.isActive = false;
    election.endDate = new Date();
    await election.save();

    res.status(200).json({
      success: true,
      message: 'Election ended successfully',
      election,
    });

  } catch (error) {
    console.error('❌ Error in endElection:', error);
    res.status(500).json({ message: 'Server error while ending election' });
  }
};

export const addCandidateToElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { candidateId } = req.body;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only election creator can add candidates' });
    }

    const isAlreadyAdded = election.candidates.includes(candidateId);
    if (isAlreadyAdded) {
      return res.status(400).json({ message: 'Candidate already added to this election' });
    }

    election.candidates.push(candidateId);
    await election.save();

    res.status(200).json({
      message: 'Candidate added to election successfully',
      candidates: election.candidates,
    });
  } catch (error) {
    console.error('❌ Error in addCandidateToElection:', error);
    res.status(500).json({ message: 'Server error while adding candidate to election' });
  }
};

export const removeCandidateFromElection = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { electionId } = req.body;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only election creator can remove candidates' });
    }

    const candidateIndex = election.candidates.findIndex(
      (id) => id.toString() === candidateId
    );

    if (candidateIndex === -1) {
      return res.status(400).json({ message: 'Candidate not found in this election' });
    }

    election.candidates.splice(candidateIndex, 1);
    await election.save();

    res.status(200).json({
      message: 'Candidate removed from election successfully',
      candidates: election.candidates,
    });
  } catch (error) {
    console.error('❌ Error in removeCandidateFromElection:', error);
    res.status(500).json({ message: 'Server error while removing candidate from election' });
  }
};
