import express from "express";

import { castVote, getVotesByElection } from "../controllers/voteController.js";

import protect from "../middleware/authMiddleware.js";

const VoteRouter = express.Router();


VoteRouter.post("/vote-candidate", protect, castVote);


VoteRouter.get("/election/:electionId", protect, getVotesByElection);

export default VoteRouter;