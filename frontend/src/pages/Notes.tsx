import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, Plus, Trash2, Edit2 } from "lucide-react";
import axios from "axios";
import { NoteCard } from "../components/NoteCard";
import { useAuth } from "../context/AuthContext";

interface UserNote {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesProps {
  isDark: boolean;
}

const API_BASE_URL = "http://localhost:5000/api";

export const Notes = ({ isDark }: NotesProps) => {
  const { isLoggedIn, setShowAuthModal } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", category: "General" });

  useEffect(() => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
    } else {
      fetchNotes();
    }
  }, [isLoggedIn]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data);
    } catch (err) {
      console.error("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Title and content are required");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/notes`,
        {
          title: formData.title,
          content: formData.content,
          category: formData.category,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes([response.data, ...notes]);
      setFormData({ title: "", content: "", category: "General" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_BASE_URL}/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((n) => n._id !== noteId));
    } catch (err) {
      console.error("Failed to delete note");
    }
  };

  const handleEditNote = async () => {
    if (!editingId || !formData.title.trim() || !formData.content.trim()) {
      alert("Title and content are required");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `${API_BASE_URL}/notes/${editingId}`,
        {
          title: formData.title,
          content: formData.content,
          category: formData.category,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes(notes.map((n) => (n._id === editingId ? response.data : n)));
      setFormData({ title: "", content: "", category: "General" });
      setEditingId(null);
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to edit note");
    }
  };

  // Get unique categories
  const categories = [...new Set(notes.map((n) => n.category))].sort();

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(note.category);

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategories, notes]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  if (!isLoggedIn) {
    return (
      <div
        className={`pt-20 min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-white"}`}
      >
        <div
          className={`text-center p-8 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
        >
          <h1
            className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Login Required
          </h1>
          <p className={isDark ? "text-slate-400" : "text-gray-600"}>
            Please log in to access your notes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pt-20 min-h-screen ${isDark ? "bg-slate-950" : "bg-white"}`}
    >
      {/* Header */}
      <section
        className={`py-16 px-4 ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1
                className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                My Notes
              </h1>
              <p
                className={`text-base sm:text-lg md:text-xl ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Create, edit, and manage your study notes
              </p>
            </motion.div>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ title: "", content: "", category: "General" });
                setShowAddForm(!showAddForm);
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Note
            </button>
          </div>
        </div>
      </section>

      {/* Add/Edit Form */}
      {showAddForm && (
        <section className={`py-8 px-4 ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}>
          <div className="max-w-7xl mx-auto">
            <div
              className={`rounded-lg border p-6 ${
                isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
              }`}
            >
              <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                {editingId ? "Edit Note" : "Create New Note"}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Note title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                >
                  <option>General</option>
                  <option>DSA</option>
                  <option>System Design</option>
                  <option>Web Development</option>
                  <option>Database</option>
                  <option>Other</option>
                </select>
                <textarea
                  placeholder="Note content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border h-40 ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                />
                <div className="flex gap-3">
                  <button
                    onClick={editingId ? handleEditNote : handleAddNote}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                  >
                    {editingId ? "Update" : "Create"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setFormData({ title: "", content: "", category: "General" });
                    }}
                    className={`px-6 py-2 rounded-lg font-semibold ${isDark ? "bg-slate-700 text-white" : "bg-gray-200 text-gray-900"}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Category Filter */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className={`lg:col-span-1 space-y-4`}
            >
              {/* Filter Header for Mobile */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`lg:hidden w-full flex items-center justify-between px-4 py-2 rounded-lg border ${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } font-semibold`}
              >
                <span>Filters</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Filter Content */}
              {isFilterOpen && (
                <div
                  className={`rounded-xl border p-6 ${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  } space-y-4`}
                >
                  <h3
                    className={`font-bold text-lg ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Categories
                  </h3>

                  <div className="space-y-3">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />
                        <span
                          className={`font-medium transition-colors group-hover:text-indigo-600 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          {category}
                        </span>
                        <span
                          className={`text-sm ml-auto ${
                            isDark ? "text-slate-500" : "text-slate-500"
                          }`}
                        >
                          ({notes.filter((n) => n.category === category).length})
                        </span>
                      </label>
                    ))}
                  </div>

                  {selectedCategories.length > 0 && (
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="w-full px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-600/10 rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Main Content - Search and Notes Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="lg:col-span-3 space-y-6"
            >
              {/* Search Bar */}
              <div
                className={`relative rounded-xl border ${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } p-4 flex items-center gap-3`}
              >
                <Search
                  size={24}
                  className={isDark ? "text-slate-500" : "text-slate-400"}
                />
                <input
                  type="text"
                  placeholder="Search notes by title or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 outline-none bg-transparent ${
                    isDark
                      ? "text-white placeholder:text-slate-500"
                      : "text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>

              {/* Results Info */}
              <p
                className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Showing {filteredNotes.length} of {notes.length} notes
                {selectedCategories.length > 0 &&
                  ` in ${selectedCategories.length} categories`}
              </p>

              {/* Notes Grid */}
              {filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNotes.map((note, index) => (
                    <motion.div
                      key={note._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      viewport={{ once: true }}
                      className={`rounded-lg border p-6 ${
                        isDark
                          ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      } transition-all`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                          >
                            {note.title}
                          </h3>
                          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {note.category}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(note._id);
                              setFormData({
                                title: note.title,
                                content: note.content,
                                category: note.category,
                              });
                              setShowAddForm(true);
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-600/10 rounded-lg transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this note?")) {
                                handleDeleteNote(note._id);
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <p
                        className={`${
                          isDark ? "text-slate-300" : "text-slate-700"
                        } line-clamp-4`}
                      >
                        {note.content}
                      </p>
                      <p
                        className={`text-xs mt-4 ${
                          isDark ? "text-slate-500" : "text-slate-500"
                        }`}
                      >
                        Created {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`text-center py-20 rounded-xl border ${
                    isDark
                      ? "bg-slate-800/50 border-slate-700"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p
                    className={`text-2xl font-semibold mb-2 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    No notes found
                  </p>
                  <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                    Create your first note to get started
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
