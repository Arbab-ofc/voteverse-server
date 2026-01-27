import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  startDate: Date,
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },

  candidates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate'
    }
  ],

  voters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  votePasswordHash: {
    type: String,
    select: false
  },
  isPasswordProtected: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Election = mongoose.model('Election', electionSchema);
export default Election;
