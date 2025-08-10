import express from "express";
import { logVoterActivity, getVoterLogsByElection } from "../controllers/voterLogController.js";
import protect from "../middleware/authMiddleware.js";

const VoterLogRouter = express.Router();


VoterLogRouter.post("/", protect, logVoterActivity);

VoterLogRouter.get("/election/:electionId", protect, getVoterLogsByElection);

export default VoterLogRouter;