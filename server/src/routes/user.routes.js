// server/src/routes/user.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getMe, updateMe } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);

export default router;
