import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Share2, Flag } from "lucide-react";

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  duration?: string;
  isDark: boolean;
}

export const YouTubePlayer = ({ videoId, title, duration, isDark }: YouTubePlayerProps) => {
  const [showOptions, setShowOptions] = useState(false);

  // Extract video ID from various URL formats
  const getVideoId = (url: string) => {
    if (!url) return "";
    // Handle youtu.be format
    if (url.includes("youtu.be")) {
      return url.split("youtu.be/")[1];
    }
    // Handle youtube.com format
    if (url.includes("youtube.com")) {
      const match = url.match(/v=([a-zA-Z0-9_-]{11})/);
      return match ? match[1] : url;
    }
    // Already a video ID
    return url;
  };

  const finalVideoId = getVideoId(videoId);
  const embedUrl = `https://www.youtube.com/embed/${finalVideoId}?rel=0&modestbranding=1`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl overflow-hidden ${isDark ? "bg-slate-900/50" : "bg-white"} border ${isDark ? "border-slate-700/50" : "border-slate-200"}`}
    >
      {/* Video Player */}
      <div className="relative w-full bg-black aspect-video">
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      {/* Video Info */}
      <div className={`p-6 ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {title}
            </h2>
            {duration && (
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Duration: {duration}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`px-4 py-2 rounded-lg transition-all ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              ⋮
            </button>

            {showOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 ${
                  isDark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"
                }`}
              >
                <button
                  onClick={() => window.open(embedUrl)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:${
                    isDark ? "bg-slate-700" : "bg-slate-100"
                  } transition-colors`}
                >
                  <Download size={18} />
                  <span>Open in YouTube</span>
                </button>
                <button
                  onClick={() => {
                    navigator.share({ title, url: window.location.href });
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:${
                    isDark ? "bg-slate-700" : "bg-slate-100"
                  } transition-colors`}
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
                <button
                  className={`w-full text-left px-4 py-3 flex items-center gap-2 text-red-500 hover:${
                    isDark ? "bg-slate-700" : "bg-slate-100"
                  } transition-colors`}
                >
                  <Flag size={18} />
                  <span>Report</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Description Placeholder */}
        <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
          <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            📚 Watch this lecture carefully and leave reviews in the comments section below.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
