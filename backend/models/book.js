import mongoose from "mongoose";

// Schema definition for the Book document
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    genre: {
      type: String,
      default: "General",
    },
    status: {
      type: String,
      enum: ["available", "borrowed", "maintenance", "archived"],
      default: "available",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  },
);

// Create and export the Mongoose model
export const Book = mongoose.model("Book", bookSchema);
