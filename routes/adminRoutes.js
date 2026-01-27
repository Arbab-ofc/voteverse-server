import express from "express";
import protect, { requireAdmin } from "../middleware/authMiddleware.js";
import {
  listUsers,
  verifyUser,
  promoteUser,
  deleteUser,
  listElections,
  deleteElectionAdmin,
  listContactMessages,
  deleteContactMessage,
} from "../controllers/adminController.js";

const AdminRouter = express.Router();

AdminRouter.use(protect, requireAdmin);

AdminRouter.get("/users", listUsers);
AdminRouter.patch("/users/:id/verify", verifyUser);
AdminRouter.patch("/users/:id/promote", promoteUser);
AdminRouter.delete("/users/:id", deleteUser);

AdminRouter.get("/elections", listElections);
AdminRouter.delete("/elections/:id", deleteElectionAdmin);

AdminRouter.get("/contact-messages", listContactMessages);
AdminRouter.delete("/contact-messages/:id", deleteContactMessage);

export default AdminRouter;
