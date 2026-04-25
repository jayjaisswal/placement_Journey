import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Star, Send, Trash2, Reply } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Comment {
  _id: string;
  user: { _id: string; name: string; email: string };
  userName: string;
  content: string;
  rating?: number;
  type: "comment" | "review";
  likes: string[];
  createdAt: string;
  replies: Comment[];
}

interface CommentsProps {
  lectureId: string;
  isDark: boolean;
}

export const CommentsSection = ({ lectureId, isDark }: CommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isReview, setIsReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { user, apiClient } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [lectureId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/comments/lecture/${lectureId}`);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await apiClient.post("/comments", {
        lecture: lectureId,
        content: newComment,
        rating: isReview ? rating : undefined,
        type: isReview ? "review" : "comment",
      });

      setComments([res.data, ...comments]);
      setNewComment("");
      setRating(5);
      setIsReview(false);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleReply = async (parentCommentId: string, replyContent: string) => {
    if (!replyContent.trim()) return;

    try {
      const res = await apiClient.post(`/comments/${parentCommentId}/reply`, {
        content: replyContent,
      });

      // Update the comment with the new reply
      setComments(
        comments.map((c) =>
          c._id === parentCommentId ? { ...c, replies: [...(c.replies || []), res.data] } : c
        )
      );
      setReplyingTo(null);
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const res = await apiClient.post(`/comments/${commentId}/like`);
      setComments(comments.map((c) => (c._id === commentId ? res.data : c)));
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await apiClient.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  if (!user) {
    return (
      <div className={`rounded-xl border p-6 text-center ${isDark ? "bg-slate-900/50 border-slate-700/50" : "bg-white border-slate-200"}`}>
        <p className={isDark ? "text-slate-400" : "text-slate-600"}>
          Please log in to comment
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${isDark ? "bg-slate-900/50 border-slate-700/50" : "bg-white border-slate-200"} p-6`}>
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="text-indigo-500" />
        <h2 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Comments & Reviews
        </h2>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setIsReview(!isReview)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              isReview
                ? "bg-yellow-500/30 text-yellow-400 border border-yellow-500/50"
                : "bg-slate-700/30 text-slate-400 border border-slate-700/50"
            }`}
          >
            {isReview ? "📝 Review Mode" : "💬 Comment Mode"}
          </button>
          {isReview && (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`transition-all ${rating >= star ? "text-yellow-500" : "text-slate-600"}`}
                >
                  <Star size={20} fill={rating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          )}
        </div>

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={isReview ? "Share your review..." : "Leave a comment..."}
          className={`w-full px-4 py-3 rounded-lg border mb-3 ${
            isDark
              ? "bg-slate-800 border-slate-700 text-white"
              : "bg-white border-slate-300 text-slate-900"
          }`}
          rows={3}
        />

        <button
          type="submit"
          className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
        >
          <Send size={18} />
          {isReview ? "Post Review" : "Post Comment"}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-4 ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {comment.userName}
                  </p>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {comment.type === "review" && comment.rating && (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= (comment.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-slate-600"}
                        />
                      ))}
                    </div>
                  )}
                  {comment.user?._id === user?.id && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="p-1 text-red-500 hover:bg-red-500/20 rounded transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Comment Content */}
              <p className={`mb-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {comment.content}
              </p>

              {/* Comment Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleLike(comment._id)}
                  className={`text-sm px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    comment.likes.includes(user?.id)
                      ? "bg-blue-500/30 text-blue-400"
                      : isDark
                      ? "bg-slate-700/30 text-slate-400 hover:bg-slate-600/30"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  👍 <span>{comment.likes.length}</span>
                </button>
                <button
                  onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  className={`text-sm px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    isDark
                      ? "bg-slate-700/30 text-slate-400 hover:bg-slate-600/30"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  <Reply size={16} /> Reply
                </button>
              </div>

              {/* Reply Form */}
              {replyingTo === comment._id && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded-lg bg-slate-700/30"
                >
                  <textarea
                    placeholder="Write your reply..."
                    className={`w-full px-3 py-2 rounded-lg border mb-2 ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-white"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                    rows={2}
                    id={`reply-${comment._id}`}
                  />
                  <button
                    onClick={() => {
                      const textarea = document.getElementById(`reply-${comment._id}`) as HTMLTextAreaElement;
                      handleReply(comment._id, textarea.value);
                      textarea.value = "";
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Reply
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
