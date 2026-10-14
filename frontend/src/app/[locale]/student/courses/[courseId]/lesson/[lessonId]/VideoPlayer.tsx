"use client";

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw,
  Settings, PictureInPicture2, Loader2, SkipForward,
} from "lucide-react";

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  play: () => void;
  pause: () => void;
}

interface VideoPlayerProps {
  src: string | null;
  title?: string;
  poster?: string | null;
  startAt?: number;
  onTimeUpdate?: (current: number, duration: number) => void;
  onPause?: (current: number) => void;
  onEnded?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function formatTime(t: number) {
  if (!isFinite(t) || t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? h + ":" : ""}${mm}:${String(s).padStart(2, "0")}`;
}

/** Returns an embeddable URL for YouTube / Vimeo links, or null for direct files. */
export function getEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer(
  { src, title, poster, startAt = 0, onTimeUpdate, onPause, onEnded, onNext, hasNext },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [error, setError] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [hoverTime, setHoverTime] = useState<{ x: number; t: number } | null>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (s) => {
      if (videoRef.current) {
        videoRef.current.currentTime = s;
        videoRef.current.play().catch(() => {});
      }
    },
    getCurrentTime: () => videoRef.current?.currentTime || 0,
    play: () => videoRef.current?.play().catch(() => {}),
    pause: () => videoRef.current?.pause(),
  }));

  // Restore user preferences
  useEffect(() => {
    const savedSpeed = Number(localStorage.getItem("player_speed"));
    const savedVol = localStorage.getItem("player_volume");
    if (savedSpeed && SPEEDS.includes(savedSpeed)) setSpeed(savedSpeed);
    if (savedVol !== null) setVolume(Number(savedVol));
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed, src]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
  }, [volume, muted]);

  // Reset when the source changes
  useEffect(() => {
    resumedRef.current = false;
    setError(false);
    setCurrent(0);
    setBuffered(0);
    setWaiting(true);
  }, [src]);

  const showFlash = (text: string) => {
    setFlash(text);
    setTimeout(() => setFlash(null), 600);
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const skip = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration || 0);
    showFlash(delta > 0 ? `+${delta}s` : `${delta}s`);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  const togglePiP = async () => {
    const v = videoRef.current as any;
    try {
      if ((document as any).pictureInPictureElement) await (document as any).exitPictureInPicture();
      else await v?.requestPictureInPicture?.();
    } catch {}
  };

  const changeSpeed = (s: number) => {
    setSpeed(s);
    localStorage.setItem("player_speed", String(s));
    setShowSpeed(false);
  };

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 2500);
  }, []);

  // Keyboard shortcuts (ignored while typing in inputs)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      const v = videoRef.current;
      if (!v) return;
      switch (e.key.toLowerCase()) {
        case " ":
        case "k": e.preventDefault(); togglePlay(); break;
        case "arrowleft": e.preventDefault(); skip(-5); break;
        case "arrowright": e.preventDefault(); skip(5); break;
        case "j": skip(-10); break;
        case "l": skip(10); break;
        case "arrowup": e.preventDefault(); setVolume((x) => Math.min(1, +(x + 0.1).toFixed(2))); setMuted(false); break;
        case "arrowdown": e.preventDefault(); setVolume((x) => Math.max(0, +(x - 0.1).toFixed(2))); break;
        case "m": setMuted((m) => !m); break;
        case "f": toggleFullscreen(); break;
        case "n": if (hasNext) onNext?.(); break;
        default: return;
      }
      revealControls();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, skip, toggleFullscreen, hasNext, onNext, revealControls]);


  const seekFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    return { ratio, x: e.clientX - rect.left };
  };

  if (!src) {
    return (
      <div className="bg-gray-950 w-full rounded-2xl overflow-hidden aspect-video flex items-center justify-center shadow-lg">
        <div className="text-center p-6">
          <Play className="w-14 h-14 text-white/30 mx-auto mb-4" />
          <p className="text-white/80 font-medium text-lg">No video for this lesson</p>
          <p className="text-white/50 text-sm mt-1">Read the lesson content below.</p>
        </div>
      </div>
    );
  }

  const embed = getEmbedUrl(src);
  if (embed) {
    return (
      <div className="bg-black w-full rounded-2xl overflow-hidden aspect-video shadow-lg">
        <iframe
          src={embed}
          title={title || "Lesson video"}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  const progressPct = duration ? (current / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`group relative bg-black w-full overflow-hidden shadow-lg select-none ${fullscreen ? "" : "rounded-2xl aspect-video"} ${controlsVisible ? "" : "cursor-none"}`}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
    >
      <video
        ref={videoRef}
        key={src}
        src={src}
        poster={poster || undefined}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          setDuration(v.duration);
          v.playbackRate = speed;
          // Resume where the student left off (unless they were near the end)
          if (!resumedRef.current && startAt > 5 && startAt < v.duration - 10) {
            v.currentTime = startAt;
            showFlash(`Resumed at ${formatTime(startAt)}`);
          }
          resumedRef.current = true;
        }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setCurrent(v.currentTime);
          onTimeUpdate?.(v.currentTime, v.duration);
        }}
        onProgress={(e) => {
          const v = e.currentTarget;
          if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
        }}
        onPlay={() => { setPlaying(true); revealControls(); }}
        onPause={(e) => { setPlaying(false); setControlsVisible(true); onPause?.(e.currentTarget.currentTime); }}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onPlaying={() => setWaiting(false)}
        onEnded={() => { setPlaying(false); setControlsVisible(true); onEnded?.(); }}
        onError={() => { setError(true); setWaiting(false); }}
      />

      {/* Loading spinner */}
      {waiting && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-white/80 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center p-6">
          <p className="text-white font-medium">This video could not be loaded.</p>
          <p className="text-white/50 text-xs mt-1 break-all max-w-md">{src}</p>
        </div>
      )}

      {/* Big center play button when paused */}
      {!playing && !waiting && !error && (
        <button
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-brand-600/90 hover:bg-brand-500 hover:scale-105 text-white flex items-center justify-center shadow-2xl transition-all"
        >
          <Play className="w-9 h-9 ml-1 fill-current" />
        </button>
      )}

      {/* Feedback flash (skip, resume…) */}
      {flash && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/70 text-white text-sm font-medium pointer-events-none">
          {flash}
        </div>
      )}

      {/* Title overlay */}
      {title && (
        <div className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0"}`}>
          <p className="text-white text-sm font-semibold line-clamp-1">{title}</p>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 inset-x-0 px-4 pb-3 pt-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {/* Seek bar */}
        <div
          className="relative h-4 flex items-center cursor-pointer group/seek"
          onClick={(e) => {
            const { ratio } = seekFromEvent(e);
            if (videoRef.current && duration) videoRef.current.currentTime = ratio * duration;
          }}
          onMouseMove={(e) => {
            const { ratio, x } = seekFromEvent(e);
            setHoverTime({ x, t: ratio * duration });
          }}
          onMouseLeave={() => setHoverTime(null)}
        >
          <div className="relative w-full h-1 group-hover/seek:h-1.5 transition-all rounded-full bg-white/20 overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-white/40" style={{ width: `${bufferedPct}%` }} />
            <div className="absolute inset-y-0 left-0 bg-brand-500" style={{ width: `${progressPct}%` }} />
          </div>
          <div
            className="absolute w-3.5 h-3.5 rounded-full bg-brand-500 ring-2 ring-white shadow scale-0 group-hover/seek:scale-100 transition-transform -translate-x-1/2"
            style={{ left: `${progressPct}%` }}
          />
          {hoverTime && (
            <div
              className="absolute -top-8 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-white text-xs font-medium pointer-events-none"
              style={{ left: hoverTime.x }}
            >
              {formatTime(hoverTime.t)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-1.5 text-white">
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={togglePlay} className="p-2 rounded-lg hover:bg-white/10" aria-label={playing ? "Pause" : "Play"}>
              {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button onClick={() => skip(-10)} className="p-2 rounded-lg hover:bg-white/10" aria-label="Back 10 seconds">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button onClick={() => skip(10)} className="p-2 rounded-lg hover:bg-white/10" aria-label="Forward 10 seconds">
              <RotateCw className="w-5 h-5" />
            </button>
            {hasNext && (
              <button onClick={onNext} className="p-2 rounded-lg hover:bg-white/10" aria-label="Next lesson">
                <SkipForward className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center group/vol">
              <button onClick={() => setMuted((m) => !m)} className="p-2 rounded-lg hover:bg-white/10" aria-label="Mute">
                {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  setMuted(v === 0);
                  localStorage.setItem("player_volume", String(v));
                }}
                className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-brand-500 cursor-pointer"
                aria-label="Volume"
              />
            </div>

            <span className="text-xs sm:text-sm font-medium tabular-nums ml-1">
              {formatTime(current)} <span className="text-white/50">/ {formatTime(duration)}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSpeed((s) => !s)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/10 text-sm font-semibold"
                aria-label="Playback speed"
              >
                <Settings className="w-4 h-4" /> {speed}x
              </button>
              {showSpeed && (
                <div className="absolute bottom-11 right-0 bg-gray-900/95 backdrop-blur rounded-xl py-1.5 shadow-2xl border border-white/10 min-w-[100px]">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`block w-full text-left px-4 py-1.5 text-sm hover:bg-white/10 ${s === speed ? "text-brand-400 font-bold" : "text-white"}`}
                    >
                      {s === 1 ? "Normal" : `${s}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={togglePiP} className="p-2 rounded-lg hover:bg-white/10 hidden sm:block" aria-label="Picture in picture">
              <PictureInPicture2 className="w-5 h-5" />
            </button>
            <button onClick={toggleFullscreen} className="p-2 rounded-lg hover:bg-white/10" aria-label="Fullscreen">
              {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;
