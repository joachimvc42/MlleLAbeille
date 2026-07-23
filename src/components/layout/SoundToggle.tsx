"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { SoundOffIcon, SoundOnIcon } from "@/components/Icons";

const STORAGE_KEY = "mllelabeille.sound.v1";
/** Drop a gentle loop at public/sounds/ambience.mp3 to enable the soundtrack. */
const TRACK_SRC = "/sounds/ambience.mp3";

/**
 * Optional ambient soundtrack.
 * Never autoplays: even with a saved "on" preference, playback only starts
 * after an explicit click in the current session (browser policies agree).
 */
export function SoundToggle() {
  const { dict } = useI18n();
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  async function toggle() {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      try {
        window.localStorage.setItem(STORAGE_KEY, "off");
      } catch {}
      return;
    }

    if (!audioRef.current) {
      const audio = new Audio(TRACK_SRC);
      audio.loop = true;
      audio.volume = 0.35;
      audio.addEventListener("error", () => {
        setAvailable(false);
        setPlaying(false);
      });
      audioRef.current = audio;
    }

    try {
      await audioRef.current.play();
      setPlaying(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, "on");
      } catch {}
    } catch {
      // Missing file or blocked playback: show the "coming soon" state.
      setAvailable(false);
    }
  }

  const label = !available
    ? dict.sound.notAvailable
    : playing
      ? dict.sound.disable
      : dict.sound.enable;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full text-[#88664E] transition-colors hover:bg-[#D77A63]/10 hover:text-[#D77A63] disabled:opacity-40"
      disabled={!available}
    >
      {playing ? (
        <SoundOnIcon className="h-5 w-5" />
      ) : (
        <SoundOffIcon className="h-5 w-5" />
      )}
    </button>
  );
}
