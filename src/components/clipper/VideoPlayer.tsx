"use client";

import { useRef, useState, useEffect } from "react";
import { Timeline, Highlight } from "./Timeline";

interface VideoPlayerProps {
  src: string;
  highlights: Highlight[];
  onTimeUpdate?: (time: number) => void;
  onHighlightChange?: (index: number, newStart: number, newEnd: number) => void;
  selectedHighlightIndex?: number;
  onSelectHighlight?: (index: number) => void;
}

export function VideoPlayer({
  src,
  highlights,
  onTimeUpdate,
  onHighlightChange,
  selectedHighlightIndex,
  onSelectHighlight,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", () => setDuration(video.duration));

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [onTimeUpdate]);

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleClipClick = (h: Highlight) => {
    if (videoRef.current) {
      videoRef.current.currentTime = h.start;
      videoRef.current.play();
      setTimeout(() => {
        if (videoRef.current && h.end - h.start > 0) {
          videoRef.current.pause();
        }
      }, (h.end - h.start) * 1000);
    }
  };

  return (
    <div className="space-y-4">
      <video
        ref={videoRef}
        src={src}
        className="w-full rounded-lg bg-black"
        controls
      />

      <Timeline
        duration={duration}
        highlights={highlights}
        currentTime={currentTime}
        onSeek={handleSeek}
        onHighlightChange={onHighlightChange}
        selectedIndex={selectedHighlightIndex}
        onSelect={onSelectHighlight}
      />

      {/* Highlight chips */}
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {highlights.map((h, i) => (
            <button
              key={i}
              onClick={() => handleClipClick(h)}
              className="px-3 py-1 text-xs bg-green-900/50 text-green-400 rounded-full hover:bg-green-900/70 transition-colors"
            >
              {h.start.toFixed(0)}s - {h.end.toFixed(0)}s ({Math.round(h.score * 100)}%)
            </button>
          ))}
        </div>
      )}
    </div>
  );
}