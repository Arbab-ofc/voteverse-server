import express from "express";
import { submitContactMessage } from "../controllers/contactController.js";

const ContactRouter = express.Router();

ContactRouter.post("/", submitContactMessage);

export default ContactRouter;
