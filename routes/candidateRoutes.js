import express from "express";

import { getCandidatesByElection , createCandidate} from "../controllers/candidateController.js";
import protect from "../middleware/authMiddleware.js";

const CandidateRouter = express.Router();


CandidateRouter.get("/election/:electionId", protect, getCandidatesByElection);
CandidateRouter.post("/add-candidate", protect, createCandidate);

export default CandidateRouter;