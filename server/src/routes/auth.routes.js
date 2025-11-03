import { body } from "express-validator";
import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post(
  "/register",
  [
    body("displayName").trim().isLength({ min: 2 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
  ],
  validate,
  register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 1 })],
  validate,
  login
);

export default router;
