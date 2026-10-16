import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api/books";

export default function App() {
  const [books, setBooks] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    status: "available",
  });
  const [editingId, setEditingId] = useState(null);
  const [batchStatus, setBatchStatus] = useState("borrowed");

  // Load books on mount or when filter changes
  useEffect(() => {
    fetchBooks();
  }, [filterStatus]);

  // Fetch logic dependent on filter status endpoint
  const fetchBooks = async () => {
    try {
      const url = filterStatus === "all" ? API_BASE : `${API_BASE}/status/${filterStatus}`;

      const res = await fetch(url);
      const result = await res.json();
      if (result.success) setBooks(result.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  // 1. Endpoint interaction: Add or Update single book
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // PUT endpoint for updating single book
        await fetch(`${API_BASE}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        setEditingId(null);
      } else {
        // POST endpoint for adding a book/job entry
        await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setFormData({ title: "", author: "", genre: "", status: "available" });
      fetchBooks();
    } catch (err) {
      console.error("Error saving book:", err);
    }
  };

  // 2. Endpoint interaction: Archive a single book
  const handleArchive = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}/archive`, { method: "PATCH" });
      fetchBooks();
    } catch (err) {
      console.error("Error archiving book:", err);
    }
  };

  // 3. Endpoint interaction: Update multiple books in batch
  const handleBatchUpdate = async () => {
    if (selectedIds.length === 0) return alert("Select books to update");
    try {
      await fetch(`${API_BASE}/batch-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          updateData: { status: batchStatus },
        }),
      });
      setSelectedIds([]);
      fetchBooks();
    } catch (err) {
      console.error("Error batch updating books:", err);
    }
  };

  // Populate form for single-book update
  const handleEditClick = (book) => {
    setEditingId(book._id);
    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      status: book.status,
    });
  };

  // Handle row selection for batch updating
  const toggleSelectBook = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="container">
      <h1>Book Inventory Management</h1>

      {/* Form: Add or Edit Book */}
      <div className="section">
        <h2>{editingId ? "Edit Book" : "Add New Book"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Genre"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
            <option value="maintenance">Maintenance</option>
            <option value="archived">Archived</option>
          </select>
          <button type="submit">{editingId ? "Update" : "Add Book"}</button>
          {editingId && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEditingId(null);
                setFormData({ title: "", author: "", genre: "", status: "available" });
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Filter and Batch Action Tools */}
      <div className="section">
        <h2>Filters & Actions</h2>
        <div>
          <label>Filter by Status Endpoint: </label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Non-Archived</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
            <option value="maintenance">Maintenance</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div style={{ marginTop: "15px" }}>
          <label>Batch Status Update for Selected ({selectedIds.length}): </label>
          <select value={batchStatus} onChange={(e) => setBatchStatus(e.target.value)}>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button onClick={handleBatchUpdate} style={{ marginLeft: "10px" }}>
            Update Selected Books
          </button>
        </div>
      </div>

      {/* Book Inventory Table */}
      <div className="section">
        <h2>Inventory ({books.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id} className={selectedIds.includes(book._id) ? "selected-row" : ""}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(book._id)}
                    onChange={() => toggleSelectBook(book._id)}
                  />
                </td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.genre}</td>
                <td>{book.status}</td>
                <td>
                  <button className="secondary" onClick={() => handleEditClick(book)}>
                    Edit
                  </button>{" "}
                  <button className="danger" onClick={() => handleArchive(book._id)}>
                    Archive
                  </button>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No books found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
