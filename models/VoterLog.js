import mongoose from 'mongoose';

const voterLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['voted', 'attempted'],
    default: 'voted'
  },
  ipAddress: {
    type: String
  }
});

const VoterLog = mongoose.model('VoterLog', voterLogSchema);
export default VoterLog;
