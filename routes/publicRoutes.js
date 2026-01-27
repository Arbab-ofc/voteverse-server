import express from "express";
import { getElectionByIdPublic } from "../controllers/electionController.js";

const PublicRouter = express.Router();

PublicRouter.get("/elections/id/:id", getElectionByIdPublic);

export default PublicRouter;
