import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
});

voteSchema.index({ voterId: 1, electionId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);
export default Vote;
