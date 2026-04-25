import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  isDark: boolean;
}

export function VideoPlayer({ videoUrl, title, isDark }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    const player = document.getElementById("video-player");
    if (player) {
      if (!isFullscreen) {
        player.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  return (
    <div
      className={`rounded-lg overflow-hidden border ${
        isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-300"
      } shadow-lg`}
    >
      <div className="relative bg-black">
        {/* Video Player Area */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
            // YouTube Video
            <div className="w-full h-full">
              <iframe
                width="100%"
                height="100%"
                src={
                  videoUrl.includes("youtu.be")
                    ? `https://www.youtube.com/embed/${videoUrl.split("/").pop()}`
                    : videoUrl.replace("watch?v=", "embed/")
                }
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
                className="w-full h-full"
              />
            </div>
          ) : (
            // Custom Video Player
            <div className="relative w-full h-full group">
              <video
                id="video-player"
                src={videoUrl}
                className="w-full h-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      const video = document.querySelector("video");
                      if (video) {
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }
                    }}
                    className="text-white hover:text-indigo-400 transition"
                  >
                    {isPlaying ? (
                      <Pause size={24} />
                    ) : (
                      <Play size={24} />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const video = document.querySelector("video");
                      if (video) {
                        video.muted = !video.muted;
                        setIsMuted(!isMuted);
                      }
                    }}
                    className="text-white hover:text-indigo-400 transition"
                  >
                    {isMuted ? (
                      <VolumeX size={24} />
                    ) : (
                      <Volume2 size={24} />
                    )}
                  </button>

                  <div className="flex-1" />

                  <button
                    onClick={handleFullscreen}
                    className="text-white hover:text-indigo-400 transition"
                  >
                    <Maximize2 size={24} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className={`p-4 ${isDark ? "bg-slate-800" : "bg-gray-50"}`}>
          <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}
