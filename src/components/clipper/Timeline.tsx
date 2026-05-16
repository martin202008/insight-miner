"use client";

import { useRef, useState, useCallback } from "react";

export interface Highlight {
  start: number;
  end: number;
  score: number;
  reason: string;
}

interface TimelineProps {
  duration: number;
  highlights: Highlight[];
  currentTime: number;
  onSeek: (time: number) => void;
  onHighlightChange?: (index: number, newStart: number, newEnd: number) => void;
  selectedIndex?: number;
  onSelect?: (index: number) => void;
}

export function Timeline({
  duration,
  highlights,
  currentTime,
  onSeek,
  onHighlightChange,
  selectedIndex,
  onSelect,
}: TimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"start" | "end" | "move" | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);

  const timeToPercent = useCallback((time: number) => {
    return Math.min(100, Math.max(0, (time / duration) * 100));
  }, [duration]);

  const percentToTime = useCallback((percent: number) => {
    return (percent / 100) * duration;
  }, [duration]);

  const handleTrackClick = (e: React.MouseEvent) => {
    if (dragging) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    onSeek(percentToTime(percent));
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    type: "start" | "end" | "move",
    index: number,
    highlight: Highlight
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setDragging(type);
    setDragIndex(index);
    setDragStartX(e.clientX);
    setDragStartTime(type === "start" ? highlight.start : highlight.end);

    if (onSelect) onSelect(index);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || dragIndex === null || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartX;
    const deltaPercent = (deltaX / rect.width) * 100;
    const deltaTime = (deltaPercent / 100) * duration;

    const highlight = highlights[dragIndex];
    if (!highlight || !onHighlightChange) return;

    if (dragging === "start") {
      const newStart = Math.max(0, Math.min(highlight.end - 0.5, dragStartTime + deltaTime));
      onHighlightChange(dragIndex, newStart, highlight.end);
    } else if (dragging === "end") {
      const newEnd = Math.max(highlight.start + 0.5, Math.min(duration, dragStartTime + deltaTime));
      onHighlightChange(dragIndex, highlight.start, newEnd);
    } else if (dragging === "move") {
      const clipDuration = highlight.end - highlight.start;
      let newStart = dragStartTime + deltaTime;
      newStart = Math.max(0, Math.min(duration - clipDuration, newStart));
      onHighlightChange(dragIndex, newStart, newStart + clipDuration);
    }
  }, [dragging, dragIndex, dragStartX, dragStartTime, duration, highlights, onHighlightChange]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setDragIndex(null);
  }, []);

  // Attach global mouse events when dragging
  useState(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  });

  const playheadPercent = timeToPercent(currentTime);

  return (
    <div className="w-full">
      {/* Time markers */}
      <div className="flex justify-between text-xs text-muted-foreground mb-1 px-1">
        <span>0:00</span>
        {duration > 0 && (
          <span>
            {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Timeline track */}
      <div
        ref={trackRef}
        className="relative h-20 bg-[#1a1a1a] rounded cursor-pointer"
        onClick={handleTrackClick}
      >
        {/* Time tick marks */}
        <div className="absolute inset-0 pointer-events-none">
          {duration > 0 && Array.from({ length: Math.floor(duration / 5) + 1 }).map((_, i) => {
            const percent = (i * 5 / duration) * 100;
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-[#333]"
                style={{ left: `${percent}%` }}
              />
            );
          })}
        </div>

        {/* Highlight regions */}
        {highlights.map((h, i) => {
          const left = timeToPercent(h.start);
          const width = timeToPercent(h.end) - left;
          const isSelected = i === selectedIndex;

          return (
            <div
              key={i}
              className={`absolute top-2 bottom-2 rounded group transition-colors ${
                isSelected ? "bg-primary/60" : "bg-primary/30 hover:bg-primary/50"
              }`}
              style={{ left: `${left}%`, width: `${width}%` }}
              onMouseDown={(e) => handleMouseDown(e, "move", i, h)}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) onSelect(i);
              }}
            >
              {/* Left handle */}
              <div
                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-primary/80 hover:bg-primary rounded-l opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleMouseDown(e, "start", i, h)}
              />

              {/* Right handle */}
              <div
                className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-primary/80 hover:bg-primary rounded-r opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleMouseDown(e, "end", i, h)}
              />

              {/* Label */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <span className="text-[10px] text-white/80 truncate px-1">
                  {h.reason.slice(0, 15)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
          style={{ left: `${playheadPercent}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
        </div>
      </div>

      {/* Time display */}
      <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
        <span>{currentTime.toFixed(1)}s</span>
        <span>{Math.round((currentTime / duration) * 100)}%</span>
      </div>
    </div>
  );
}
