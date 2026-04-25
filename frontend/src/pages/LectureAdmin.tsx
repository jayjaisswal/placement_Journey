import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Lecture {
  _id: string;
  title: string;
  description?: string;
  instructor?: string;
  videoUrl?: string;
  duration?: string;
  category: string;
  thumbnail?: string;
  isFolder?: boolean;
  parentFolder?: string;
  order?: number;
  resources?: { title: string; url: string; type: string }[];
}

interface LectureAdminProps {
  isDark: boolean;
}

const API_BASE_URL = "http://localhost:5000/api";

export function LectureAdmin({ isDark }: LectureAdminProps) {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Lecture>>({
    title: "",
    description: "",
    instructor: "",
    videoUrl: "",
    duration: "",
    category: "",
    thumbnail: "",
    isFolder: false,
    parentFolder: null,
    order: 0,
  });
  const [folders, setFolders] = useState<Lecture[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }

    if (user?.role !== "admin") {
      navigate("/");
      return;
    }

    fetchLectures();
  }, [isLoggedIn, user]);

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch all lectures
      const response = await axios.get(`${API_BASE_URL}/lectures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLectures(response.data);

      // Fetch folders
      const folderResponse = await axios.get(
        `${API_BASE_URL}/lectures/folders/tree`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFolders(folderResponse.data);
    } catch (err) {
      console.error("Failed to fetch lectures:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category) {
      alert("Title and category are required");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      if (editingId) {
        // Update
        await axios.put(`${API_BASE_URL}/lectures/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create
        await axios.post(`${API_BASE_URL}/lectures`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchLectures();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        instructor: "",
        videoUrl: "",
        duration: "",
        category: "",
        thumbnail: "",
        isFolder: false,
        parentFolder: null,
        order: 0,
      });
    } catch (err) {
      console.error("Failed to save lecture:", err);
      alert("Failed to save lecture. Check console for details.");
    }
  };

  const handleEdit = (lecture: Lecture) => {
    setFormData(lecture);
    setEditingId(lecture._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lecture?"))
      return;

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${API_BASE_URL}/lectures/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLectures();
    } catch (err) {
      console.error("Failed to delete lecture:", err);
      alert("Failed to delete lecture");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      instructor: "",
      videoUrl: "",
      duration: "",
      category: "",
      thumbnail: "",
      isFolder: false,
      parentFolder: null,
      order: 0,
    });
  };

  if (!isLoggedIn || user?.role !== "admin") {
    return (
      <div
        className={`min-h-screen pt-20 flex items-center justify-center ${
          isDark ? "bg-slate-950" : "bg-white"
        }`}
      >
        <p className={isDark ? "text-slate-400" : "text-slate-600"}>
          Admin access required
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen pt-20 flex items-center justify-center ${
          isDark ? "bg-slate-950" : "bg-white"
        }`}
      >
        <p className={isDark ? "text-slate-400" : "text-slate-600"}>
          Loading lectures...
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 ${isDark ? "bg-slate-950" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1
            className={`text-4xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Manage Lectures
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            Add Lecture
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-8 rounded-lg border p-6 ${
              isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {editingId ? "Edit Lecture" : "Create New Lecture"}
              </h2>
              <button
                onClick={handleCloseForm}
                className={`p-2 rounded-lg ${
                  isDark
                    ? "hover:bg-slate-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-200"
                    }`}
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category || ""}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-200"
                    }`}
                  />
                </div>

                {/* Instructor */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Instructor
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-200"
                    }`}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., 45 min"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-200"
                    }`}
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Video URL
                  </label>
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl || ""}
                    onChange={handleInputChange}
                    placeholder="YouTube URL or video ID"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-200"
                    }`}
                  />
                </div>

                {/* Thumbnail */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Thumbnail URL
                  </label>
                  <input
                    type="text"
                    name="thumbnail"
                    value={formData.thumbnail || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-200"
                    }`}
                  />
                </div>

                {/* Parent Folder */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Parent Folder
                  </label>
                  <select
                    name="parentFolder"
                    value={formData.parentFolder || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <option value="">None (Root level)</option>
                    {folders.map((folder) => (
                      <option key={folder._id} value={folder._id}>
                        {folder.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order || 0}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-200"
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-gray-200"
                  }`}
                />
              </div>

              {/* Is Folder */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFolder"
                    checked={formData.isFolder || false}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                    This is a folder (can contain other lectures)
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Check size={20} />
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className={`px-6 py-3 rounded-lg transition ${
                    isDark
                      ? "bg-slate-700 hover:bg-slate-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Lectures List */}
        <div
          className={`rounded-lg border overflow-hidden ${
            isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className={isDark ? "bg-slate-700" : "bg-gray-100"}
              >
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {lectures.map((lecture) => (
                  <tr
                    key={lecture._id}
                    className={`border-t ${
                      isDark
                        ? "border-slate-700 hover:bg-slate-700/50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">{lecture.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-600/20 text-indigo-600 rounded-full text-sm">
                        {lecture.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm ${
                          lecture.isFolder
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        {lecture.isFolder ? "📁 Folder" : "🎥 Video"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {lecture.instructor || "—"}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(lecture)}
                        className="p-2 text-blue-600 hover:bg-blue-600/10 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(lecture._id)}
                        className="p-2 text-red-600 hover:bg-red-600/10 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {lectures.length === 0 && (
            <div
              className={`p-12 text-center ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <p>No lectures yet. Create your first lecture!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
