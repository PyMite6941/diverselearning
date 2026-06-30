"use client";

import { useEffect, useRef, useState } from "react";

interface LessonReaderProps {
  /** Lesson paragraphs — each one is treated as a numbered "line". */
  body: string[];
  accent?: string;
}

/** Renders lesson text with three reading aids: line numbers, a clickable
 *  line-reader highlight (a reading guide for the current line), and
 *  text-to-speech playback that highlights each line as it's spoken. */
export default function LessonReader({ body, accent = "#7c5cff" }: LessonReaderProps) {
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [lineReaderOn, setLineReaderOn] = useState(true);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const speakingLineRef = useRef<number | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  // New lesson body (or unmount): stop any speech and reset reading state.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      speakingLineRef.current = null;
      setSpeaking(false);
      setPaused(false);
      setActiveLine(null);
    };
  }, [body]);

  function speakFrom(index: number) {
    const synth = window.speechSynthesis;
    synth.cancel();
    setSpeaking(true);
    setPaused(false);

    const speakLine = (i: number) => {
      if (i >= body.length) {
        speakingLineRef.current = null;
        setSpeaking(false);
        setActiveLine(null);
        return;
      }
      const utter = new SpeechSynthesisUtterance(body[i]);
      utter.onstart = () => {
        speakingLineRef.current = i;
        setActiveLine(i);
      };
      utter.onend = () => {
        if (speakingLineRef.current === i) speakLine(i + 1);
      };
      utter.onerror = () => setSpeaking(false);
      synth.speak(utter);
    };
    speakLine(index);
  }

  function handlePlayPause() {
    const synth = window.speechSynthesis;
    if (speaking && !paused) {
      synth.pause();
      setPaused(true);
    } else if (speaking && paused) {
      synth.resume();
      setPaused(false);
    } else {
      speakFrom(activeLine ?? 0);
    }
  }

  function handleStop() {
    window.speechSynthesis.cancel();
    speakingLineRef.current = null;
    setSpeaking(false);
    setPaused(false);
    setActiveLine(null);
  }

  function handleLineClick(i: number) {
    if (!lineReaderOn || speaking) return;
    setActiveLine((cur) => (cur === i ? null : i));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setShowLineNumbers((v) => !v)}
          title="Show line numbers"
          aria-pressed={showLineNumbers}
          className={`rounded-full border px-3 py-1.5 font-medium transition ${
            showLineNumbers
              ? "border-white/20 bg-white/10 text-white"
              : "border-white/10 text-white/50 hover:text-white"
          }`}
        >
          # Line numbers
        </button>
        <button
          onClick={() => setLineReaderOn((v) => !v)}
          title="Highlight the line you're reading"
          aria-pressed={lineReaderOn}
          className={`rounded-full border px-3 py-1.5 font-medium transition ${
            lineReaderOn
              ? "border-white/20 bg-white/10 text-white"
              : "border-white/10 text-white/50 hover:text-white"
          }`}
        >
          ▤ Line reader
        </button>
        {supported && (
          <>
            <button
              onClick={handlePlayPause}
              title="Listen to this lesson"
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-medium text-white transition hover:bg-white/15"
            >
              {speaking && !paused ? "⏸ Pause" : speaking && paused ? "▶ Resume" : "🔊 Listen"}
            </button>
            {speaking && (
              <button
                onClick={handleStop}
                title="Stop listening"
                className="rounded-full border border-white/10 px-3 py-1.5 font-medium text-white/60 transition hover:text-white"
              >
                ■ Stop
              </button>
            )}
          </>
        )}
      </div>

      <div className="space-y-1">
        {body.map((p, i) => {
          const isActive = activeLine === i;
          return (
            <p
              key={i}
              onClick={() => handleLineClick(i)}
              className={`flex gap-3 rounded-lg px-2.5 py-1.5 leading-relaxed transition ${
                lineReaderOn && !speaking ? "cursor-pointer" : ""
              } ${isActive ? "bg-white/10 text-white" : "text-white/75"}`}
              style={isActive ? { boxShadow: `inset 3px 0 0 ${accent}` } : undefined}
            >
              {showLineNumbers && (
                <span className="select-none pt-0.5 font-mono text-xs text-white/30">
                  {i + 1}
                </span>
              )}
              <span>{p}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
}
