import { Router } from "express";
import {
  createBook,
  updateSingleBook,
  updateMultipleBooks,
  archiveBook,
  getBooksByStatus,
  getAllBooks,
} from "../controllers/bookController.js";

const router = Router();

// Retrieve all non-archived books
router.get("/", getAllBooks);

// Endpoint for adding a book/job
router.post("/", createBook);

// Endpoint for updating multiple books in batch
router.patch("/batch-update", updateMultipleBooks);

// Endpoint for getting books that have a specific status
router.get("/status/:status", getBooksByStatus);

// Endpoint for updating a single book
router.put("/:id", updateSingleBook);

// Endpoint for archiving a book
router.patch("/:id/archive", archiveBook);

export default router;
