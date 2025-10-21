import express from "express";
import { getSettings, updateSettings } from "../controllers/settingController.js";
import { checkUserAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(checkUserAuth);

router.get("/", getSettings);
router.put("/", updateSettings);

export default router;
