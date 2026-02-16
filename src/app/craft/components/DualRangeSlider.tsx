"use client";

import { useState, useRef, useEffect, useCallback } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  startTime: number;
  endTime: number;
  currentTime?: number;
  onStartTimeChange: (value: number) => void;
  onEndTimeChange: (value: number) => void;
  onSeek?: (value: number) => void;
  formatTime?: (seconds: number) => string;
  className?: string;
}

export default function DualRangeSlider({
  min,
  max,
  startTime,
  endTime,
  currentTime,
  onStartTimeChange,
  onEndTimeChange,
  onSeek,
  formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`,
  className = ""
}: DualRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'seek' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = useCallback((value: number) => {
    return ((value - min) / (max - min)) * 100;
  }, [min, max]);

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return min;
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + percentage * (max - min));
  }, [min, max]);

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'start' | 'end' | 'seek') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(type);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const value = getValueFromPosition(e.clientX);

    if (isDragging === 'start') {
      const newStartTime = Math.min(value, endTime - 1);
      onStartTimeChange(Math.max(min, newStartTime));
    } else if (isDragging === 'end') {
      const newEndTime = Math.max(value, startTime + 1);
      onEndTimeChange(Math.min(max, newEndTime));
    } else if (isDragging === 'seek' && onSeek) {
      onSeek(value);
    }
  }, [isDragging, getValueFromPosition, startTime, endTime, min, max, onStartTimeChange, onEndTimeChange, onSeek]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const startPercent = getPercentage(startTime);
  const endPercent = getPercentage(endTime);
  const currentPercent = currentTime !== undefined ? getPercentage(currentTime) : null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Time Labels */}
      <div className="flex justify-between text-sm text-white/70">
        <span>{formatTime(startTime)}</span>
        <span>{formatTime(endTime)}</span>
      </div>

      {/* Slider Track */}
      <div
        ref={sliderRef}
        className="relative h-8 cursor-pointer"
        onMouseDown={(e) => {
          // If clicking on the track (not on a handle), seek to that position
          if (onSeek) {
            const value = getValueFromPosition(e.clientX);
            onSeek(value);
          }
        }}
      >
        {/* Background Track */}
        <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-lg bg-white/10" />

        {/* Selected Range Track */}
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-lg bg-blue-500/50"
          style={{
            left: `${startPercent}%`,
            width: `${endPercent - startPercent}%`,
          }}
        />

        {/* Current Time Indicator */}
        {currentPercent !== null && (
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2 w-0.5 bg-white"
            style={{
              left: `${currentPercent}%`,
            }}
          />
        )}

        {/* Start Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing z-10"
          style={{ left: `${startPercent}%` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(e, 'start');
          }}
        >
          <div className="h-5 w-5 rounded-full bg-blue-500 border-2 border-white shadow-lg hover:bg-blue-400 transition-colors" />
        </div>

        {/* End Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing z-10"
          style={{ left: `${endPercent}%` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(e, 'end');
          }}
        >
          <div className="h-5 w-5 rounded-full bg-blue-500 border-2 border-white shadow-lg hover:bg-blue-400 transition-colors" />
        </div>
      </div>

      {/* Duration Display */}
      <div className="text-center text-sm text-white/70">
        Duration: {formatTime(endTime - startTime)}
      </div>
    </div>
  );
}

