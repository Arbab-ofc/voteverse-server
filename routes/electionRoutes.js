import express from "express";

import {
  createElection,
  getAllElections,
  updateElection,
  deleteElection,
  getMyElections,
  getElectionResult,
  endElection,
  getElectionById,
  addCandidateToElection,
  removeCandidateFromElection,
} from '../controllers/electionController.js'

import protect from "../middleware/authMiddleware.js";

const ElectionRouter = express.Router();


ElectionRouter.post("/create-election", protect, createElection);


ElectionRouter.get("/all", protect, getAllElections);


ElectionRouter.get("/id/:id", protect, getElectionById);


ElectionRouter.put("/:id", protect, updateElection);


ElectionRouter.delete("/:id", protect, deleteElection);


ElectionRouter.get("/my", protect, getMyElections);


ElectionRouter.get("/result/:id", protect, getElectionResult);


ElectionRouter.put("/end/:id", protect, endElection);

ElectionRouter.post("/:id/candidates", protect, addCandidateToElection);


ElectionRouter.delete("/:id/candidates/:candidateId", protect, removeCandidateFromElection);

export default ElectionRouter;