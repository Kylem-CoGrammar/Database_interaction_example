import { Book } from "../models/book.js";

/**
 * Controller using purely functional exports (standalone functions)
 * rather than OOP classes.
 */

// Helper utility to safely execute DB operations without throwing uncaught errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 1. Endpoint logic for adding a book/job entry
export const createBook = asyncHandler(async (req, res) => {
  const { title, author, genre, status } = req.body;

  if (!title || !author) {
    return res.status(400).json({ success: false, message: "Title and author are required." });
  }

  const newBook = await Book.create({ title, author, genre, status });
  return res.status(201).json({ success: true, data: newBook });
});

// 2. Endpoint logic for updating a single book by ID
export const updateSingleBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
    new: true, // Returns the updated document
    runValidators: true,
  });

  if (!updatedBook) {
    return res.status(404).json({ success: false, message: "Book not found" });
  }

  return res.status(200).json({ success: true, data: updatedBook });
});

// 3. Endpoint logic for updating multiple books in batch
export const updateMultipleBooks = asyncHandler(async (req, res) => {
  const { ids, updateData } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide an array of book IDs." });
  }

  const result = await Book.updateMany(
    { _id: { $in: ids } },
    { $set: updateData },
    { runValidators: true },
  );

  return res.status(200).json({
    success: true,
    message: `${result.modifiedCount} books updated successfully.`,
    data: result,
  });
});

// 4. Endpoint logic for archiving a book (Soft delete setting status to 'archived' & isArchived to true)
export const archiveBook = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const archivedBook = await Book.findByIdAndUpdate(
    id,
    { status: "archived", isArchived: true },
    { new: true },
  );

  if (!archivedBook) {
    return res.status(404).json({ success: false, message: "Book not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Book archived successfully.",
    data: archivedBook,
  });
});

// 5. Endpoint logic for getting books by specific status
export const getBooksByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;

  const books = await Book.find({ status });

  return res.status(200).json({
    success: true,
    count: books.length,
    data: books,
  });
});

// Additional utility: Get all non-archived books for front-end rendering
export const getAllBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ isArchived: false });
  return res.status(200).json({ success: true, count: books.length, data: books });
});
