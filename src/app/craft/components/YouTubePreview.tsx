"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import WaveSurfer from 'wavesurfer.js';
import DualRangeSlider from './DualRangeSlider';

interface YouTubePreviewProps {
  videoId: string;
  startTime: number;
  endTime: number;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onStartTimeChange?: (startTime: number) => void;
  onEndTimeChange?: (endTime: number) => void;
  showWaveform?: boolean;
  className?: string;
}

export default function YouTubePreview({
  videoId,
  startTime,
  endTime,
  onTimeUpdate,
  onDurationChange,
  onStartTimeChange,
  onEndTimeChange,
  showWaveform = false,
  className = ""
}: YouTubePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [waveformError, setWaveformError] = useState<string | null>(null);
  
  const playerRef = useRef<YouTube>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // YouTube player options
  const opts: YouTubeProps['opts'] = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
      start: Math.floor(startTime),
      end: Math.floor(endTime)
    },
  };

  // Initialize wavesurfer if requested
  useEffect(() => {
    if (showWaveform && waveformContainerRef.current && !wavesurferRef.current) {
      try {
        wavesurferRef.current = WaveSurfer.create({
          container: waveformContainerRef.current,
          waveColor: '#4F4A85',
          progressColor: '#6366f1',
          cursorColor: '#ffffff',
          barWidth: 2,
          barRadius: 3,
          height: 60,
          normalize: true,
          backend: 'WebAudio',
          mediaControls: false,
        });

        // Sync wavesurfer with YouTube player
        wavesurferRef.current.on('play', () => {
          if (playerRef.current?.internalPlayer) {
            playerRef.current.internalPlayer.playVideo();
          }
        });

        wavesurferRef.current.on('pause', () => {
          if (playerRef.current?.internalPlayer) {
            playerRef.current.internalPlayer.pauseVideo();
          }
        });

        wavesurferRef.current.on('interaction', (progress: number) => {
          if (playerRef.current?.internalPlayer && duration > 0) {
            const seekTime = startTime + (progress * (endTime - startTime));
            playerRef.current.internalPlayer.seekTo(seekTime);
          }
        });

        // Note: For actual audio visualization, you would need to extract audio from YouTube
        // This is a placeholder that shows the waveform structure
        setWaveformError('Audio extraction from YouTube requires server-side processing');
      } catch (error) {
        console.error('Failed to initialize wavesurfer:', error);
        setWaveformError('Failed to initialize audio visualization');
      }
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [showWaveform, startTime, endTime, duration]);

  // Time tracking functions - track continuously to keep playhead updated
  const endTimeRef = useRef(endTime);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  
  // Keep refs in sync with latest values
  useEffect(() => {
    endTimeRef.current = endTime;
    onTimeUpdateRef.current = onTimeUpdate;
  }, [endTime, onTimeUpdate]);

  const startTimeTracking = useCallback(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    intervalRef.current = setInterval(() => {
      if (playerRef.current?.internalPlayer) {
        try {
          const playerCurrentTime = playerRef.current.internalPlayer.getCurrentTime();
          // Only update if we get a valid number
          if (typeof playerCurrentTime === 'number' && !isNaN(playerCurrentTime) && isFinite(playerCurrentTime)) {
            setCurrentTime(playerCurrentTime);
            onTimeUpdateRef.current?.(playerCurrentTime);
            
            // Check if we've reached the end time
            if (playerCurrentTime >= endTimeRef.current) {
              playerRef.current.internalPlayer.pauseVideo();
            }
          }
        } catch {
          // Player might not be ready yet - silently continue
        }
      }
    }, 100);
  }, []); // No dependencies - uses refs instead

  const stopTimeTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle YouTube player events
  const onPlayerReady = useCallback((event: { target: { getDuration: () => number; getCurrentTime: () => number } }) => {
    setIsPlayerReady(true);
    const player = event.target;
    const videoDuration = player.getDuration();
    setDuration(videoDuration);
    onDurationChange?.(videoDuration);
    
    // Initialize currentTime when player is ready
    try {
      const initialTime = player.getCurrentTime();
      if (typeof initialTime === 'number' && !isNaN(initialTime) && isFinite(initialTime)) {
        setCurrentTime(initialTime);
      }
    } catch (error) {
      console.error('Error getting initial time:', error);
    }
  }, [onDurationChange]);

  const onPlayerStateChange = useCallback((event: { data: number }) => {
    const state = event.data;
    setIsPlaying(state === 1); // 1 = playing

    // Update currentTime immediately on state change
    if (playerRef.current?.internalPlayer) {
      try {
        const playerCurrentTime = playerRef.current.internalPlayer.getCurrentTime();
        if (typeof playerCurrentTime === 'number' && !isNaN(playerCurrentTime) && isFinite(playerCurrentTime)) {
          setCurrentTime(playerCurrentTime);
        }
      } catch (error) {
        console.error('Error getting current time on state change:', error);
      }
    }

    // Note: We don't stop/start tracking here - it runs continuously once player is ready
    // This ensures we always know the current position, even when paused
  }, []);

  const onPlayerError = useCallback((event: { data: number }) => {
    console.error('YouTube player error:', event);
  }, []);

  // Control functions
  const handlePlayPause = useCallback(() => {
    if (!isPlayerReady) return;
    
    if (isPlaying) {
      playerRef.current?.internalPlayer.pauseVideo();
    } else {
      playerRef.current?.internalPlayer.playVideo();
    }
  }, [isPlaying, isPlayerReady]);

  const handleSeek = useCallback((seekTime: number) => {
    if (!isPlayerReady || !duration) return;
    
    // Clamp seek time to be within start and end bounds
    const clampedSeekTime = Math.max(startTime, Math.min(endTime, seekTime));
    playerRef.current?.internalPlayer.seekTo(clampedSeekTime);
    setCurrentTime(clampedSeekTime);
  }, [isPlayerReady, duration, startTime, endTime]);

  const handleStartTimeChange = useCallback((newStartTime: number) => {
    onStartTimeChange?.(newStartTime);
    // If current time is before new start time, seek to start
    if (currentTime < newStartTime && isPlayerReady) {
      playerRef.current?.internalPlayer.seekTo(newStartTime);
      setCurrentTime(newStartTime);
    }
  }, [onStartTimeChange, currentTime, isPlayerReady]);

  const handleEndTimeChange = useCallback((newEndTime: number) => {
    onEndTimeChange?.(newEndTime);
    // If current time is after new end time, seek to end
    if (currentTime > newEndTime && isPlayerReady) {
      playerRef.current?.internalPlayer.seekTo(newEndTime);
      setCurrentTime(newEndTime);
    }
  }, [onEndTimeChange, currentTime, isPlayerReady]);

  // Format time helper
  const formatTime = (seconds: number) => {
    // Handle NaN, undefined, or invalid values
    if (typeof seconds !== 'number' || isNaN(seconds) || !isFinite(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.floor(Math.max(0, seconds) % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start tracking time as soon as player is ready (even when paused)
  useEffect(() => {
    if (isPlayerReady) {
      startTimeTracking();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlayerReady, startTimeTracking]);

  // Update player options when start/end time changes
  useEffect(() => {
    if (isPlayerReady && playerRef.current?.internalPlayer) {
      // Update the player's start and end times
      try {
        playerRef.current.internalPlayer.getOptions();
      } catch {
        // Options might not be directly settable, but the player will respect the initial opts
      }
    }
  }, [startTime, endTime, isPlayerReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimeTracking();
    };
  }, [stopTimeTracking]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* YouTube Player */}
      <div className="relative">
        <YouTube
          ref={playerRef}
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          onError={onPlayerError}
          className="w-full h-full"
        />
      </div>

      {/* Waveform (if enabled) */}
      {showWaveform && (
        <div className="space-y-2">
          <div 
            ref={waveformContainerRef} 
            className="w-full h-16 bg-white/5 rounded-lg border border-white/10"
          />
          {waveformError && (
            <p className="text-xs text-amber-400 text-center">
              {waveformError}
            </p>
          )}
        </div>
      )}

      {/* Timeline Controls */}
      <div className="space-y-3">
        {/* Dual Range Slider for Start/End Time Selection and Playback */}
        {duration > 0 && (
          <DualRangeSlider
            min={0}
            max={duration}
            startTime={startTime}
            endTime={endTime}
            currentTime={currentTime}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            onSeek={handleSeek}
            formatTime={formatTime}
          />
        )}

        {/* Play/Pause Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={!isPlayerReady}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-400 disabled:bg-white/20 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
