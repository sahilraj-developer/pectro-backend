import express from "express";
import {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord
} from "../controllers/recordController.js";
import { checkUserAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(checkUserAuth);

router.get("/", getRecords);
router.post("/", createRecord);
router.put("/:id", updateRecord);
router.delete("/:id", deleteRecord);

export default router;
