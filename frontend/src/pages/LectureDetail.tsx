import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Bookmark, Play } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { VideoPlayer } from "../components/VideoPlayer";
import { CommentsSection } from "../components/LectureComments";

interface Lecture {
  _id: string;
  title: string;
  description?: string;
  instructor?: string;
  url?: string;
  videoUrl?: string;
  duration?: string;
  category: string;
  thumbnail?: string;
  savedBy: string[];
  createdAt: string;
  views?: number;
  isFolder?: boolean;
  parentFolder?: string;
}

interface LectureDetailProps {
  isDark: boolean;
}

const API_BASE_URL = "http://localhost:5000/api";

export function LectureDetail({ isDark }: LectureDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, setShowAuthModal, user } = useAuth();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [relatedLectures, setRelatedLectures] = useState<Lecture[]>([]);
  const [subLectures, setSubLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  // Handle auth redirect
  useEffect(() => {
    if (!isLoggedIn) {
      setShowAuthWarning(true);
      setShowAuthModal(true);
      return;
    }
    setShowAuthWarning(false);
    fetchLecture();
  }, [id, isLoggedIn]);

  const fetchLecture = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Fetch main lecture
      const response = await axios.get(`${API_BASE_URL}/lectures/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLecture(response.data);
      
      // Check if saved by current user
      if (user?.id && response.data.savedBy?.includes(user.id)) {
        setIsSaved(true);
      }
      
      // Fetch related lectures (folder structure)
      try {
        const relatedResponse = await axios.get(
          `${API_BASE_URL}/lectures/${id}/related`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (relatedResponse.data.subLectures) {
          setSubLectures(relatedResponse.data.subLectures);
        }
        if (relatedResponse.data.siblings) {
          setRelatedLectures(relatedResponse.data.siblings);
        }
      } catch (err) {
        console.error("Failed to fetch related lectures:", err);
      }
    } catch (err) {
      console.error("Failed to fetch lecture:", err);
      // Don't navigate away, show error to user
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLecture = async () => {
    if (!lecture || !isLoggedIn) return;

    const token = localStorage.getItem("token");
    try {
      if (isSaved) {
        await axios.post(
          `${API_BASE_URL}/lectures/${lecture._id}/unsave`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsSaved(false);
      } else {
        await axios.post(
          `${API_BASE_URL}/lectures/${lecture._id}/save`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Failed to save lecture:", err);
    }
  };

  const handleNavigateToLecture = (lectureId: string) => {
    navigate(`/lectures/${lectureId}`);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen pt-20 flex items-center justify-center ${
          isDark ? "bg-slate-950" : "bg-white"
        }`}
      >
        <p className={isDark ? "text-slate-400" : "text-slate-600"}>Loading lecture...</p>
      </div>
    );
  }

  if (showAuthWarning && !isLoggedIn) {
    return (
      <div
        className={`min-h-screen pt-20 flex items-center justify-center flex-col gap-4 ${
          isDark ? "bg-slate-950" : "bg-white"
        }`}
      >
        <p className={`text-lg font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
          Please log in to view lectures
        </p>
        <p className={isDark ? "text-slate-400" : "text-slate-600"}>Click the login button in the navbar</p>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div
        className={`min-h-screen pt-20 flex items-center justify-center ${
          isDark ? "bg-slate-950" : "bg-white"
        }`}
      >
        <p className={isDark ? "text-slate-400" : "text-slate-600"}>Lecture not found</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 ${isDark ? "bg-slate-950" : "bg-white"}`}>
      {/* Header */}
      <div className={`${isDark ? "bg-slate-900/50" : "bg-slate-50"} py-8 px-4 border-b ${isDark ? "border-slate-800" : "border-gray-200"}`}>
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/lectures")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Lectures
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1
                className={`text-3xl md:text-4xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {lecture.title}
              </h1>
              <div className={`text-sm space-y-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {lecture.instructor && <p>Instructor: {lecture.instructor}</p>}
                {lecture.duration && <p>Duration: {lecture.duration}</p>}
                {lecture.category && <p>Category: {lecture.category}</p>}
                {lecture.views !== undefined && <p>Views: {lecture.views}</p>}
              </div>
            </div>

            <button
              onClick={handleSaveLecture}
              className={`p-3 rounded-lg transition ${
                isSaved
                  ? "bg-red-600/20 text-red-600"
                  : isDark
                  ? "bg-slate-800 text-slate-400 hover:text-red-600"
                  : "bg-gray-100 text-gray-600 hover:text-red-600"
              }`}
              title={isSaved ? "Remove from saved" : "Save lecture"}
            >
              <Heart size={24} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Video Player */}
            {(lecture.videoUrl || lecture.url) && (
              <VideoPlayer videoUrl={lecture.videoUrl || lecture.url} title={lecture.title} isDark={isDark} />
            )}

            {/* Description */}
            {lecture.description && (
              <div
                className={`rounded-lg border p-6 ${
                  isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                }`}
              >
                <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                  About this Lecture
                </h2>
                <p className={`whitespace-pre-wrap ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {lecture.description}
                </p>
              </div>
            )}

            {/* Comments Section */}
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
                Discussion & Reviews
              </h2>
              <CommentsSection lectureId={lecture._id} isDark={isDark} />
            </div>
          </motion.div>

          {/* Sidebar - Related Content & Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Lecture Details */}
            <div
              className={`rounded-lg border p-6 ${
                isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                Lecture Details
              </h3>

              <div className="space-y-4 text-sm">
                {lecture.category && (
                  <div>
                    <p className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      Category
                    </p>
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                      {lecture.category}
                    </p>
                  </div>
                )}

                {lecture.instructor && (
                  <div>
                    <p className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      Instructor
                    </p>
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                      {lecture.instructor}
                    </p>
                  </div>
                )}

                {lecture.duration && (
                  <div>
                    <p className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      Duration
                    </p>
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                      {lecture.duration}
                    </p>
                  </div>
                )}

                <div>
                  <p className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Published
                  </p>
                  <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                    {new Date(lecture.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Saved by
                  </p>
                  <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                    {lecture.savedBy?.length || 0} users
                  </p>
                </div>

                <div>
                  <p className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Views
                  </p>
                  <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                    {lecture.views || 0}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSaveLecture}
                className={`w-full mt-4 py-2 px-4 rounded-lg font-semibold transition ${
                  isSaved
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isSaved ? "❤️ Saved" : "💾 Save Lecture"}
              </button>
            </div>

            {/* Sub-Lectures (Folder Structure) */}
            {subLectures.length > 0 && (
              <div
                className={`rounded-lg border p-6 ${
                  isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                }`}
              >
                <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                  📁 Sub-Lectures
                </h3>
                <div className="space-y-3">
                  {subLectures.map((subLecture) => (
                    <motion.button
                      key={subLecture._id}
                      onClick={() => handleNavigateToLecture(subLecture._id)}
                      whileHover={{ x: 4 }}
                      className={`w-full text-left p-3 rounded-lg transition flex items-start justify-between group ${
                        isDark
                          ? "bg-slate-700/50 hover:bg-slate-700"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm line-clamp-2 ${isDark ? "text-white" : "text-slate-900"} group-hover:text-indigo-600`}>
                          {subLecture.title}
                        </p>
                        {subLecture.duration && (
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {subLecture.duration}
                          </p>
                        )}
                      </div>
                      <Play size={16} className={`ml-2 flex-shrink-0 ${isDark ? "text-slate-400" : "text-slate-500"} group-hover:text-indigo-600`} />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Related Lectures (Siblings) */}
            {relatedLectures.length > 0 && (
              <div
                className={`rounded-lg border p-6 ${
                  isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                }`}
              >
                <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                  🔗 Related Lectures
                </h3>
                <div className="space-y-3">
                  {relatedLectures.map((relatedLecture) => (
                    <motion.button
                      key={relatedLecture._id}
                      onClick={() => handleNavigateToLecture(relatedLecture._id)}
                      whileHover={{ x: 4 }}
                      className={`w-full text-left p-3 rounded-lg transition flex items-start justify-between group ${
                        isDark
                          ? "bg-slate-700/50 hover:bg-slate-700"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm line-clamp-2 ${isDark ? "text-white" : "text-slate-900"} group-hover:text-indigo-600`}>
                          {relatedLecture.title}
                        </p>
                        {relatedLecture.duration && (
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {relatedLecture.duration}
                          </p>
                        )}
                      </div>
                      <Play size={16} className={`ml-2 flex-shrink-0 ${isDark ? "text-slate-400" : "text-slate-500"} group-hover:text-indigo-600`} />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
