import express from "express";
import protect, { requireAdmin } from "../middleware/authMiddleware.js";
import {
  listUsers,
  verifyUser,
  promoteUser,
  listElections,
  deleteElectionAdmin,
  listContactMessages,
} from "../controllers/adminController.js";

const AdminRouter = express.Router();

AdminRouter.use(protect, requireAdmin);

AdminRouter.get("/users", listUsers);
AdminRouter.patch("/users/:id/verify", verifyUser);
AdminRouter.patch("/users/:id/promote", promoteUser);

AdminRouter.get("/elections", listElections);
AdminRouter.delete("/elections/:id", deleteElectionAdmin);

AdminRouter.get("/contact-messages", listContactMessages);

export default AdminRouter;
