import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Users } from "lucide-react";
import { useLiveChannel } from "@/hooks/use-live-channel";
import {
  getAction,
  type InteractionPayload,
  type LiveEvent,
  type PresenceState,
} from "@/lib/interactions";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "PulseLive Dashboard — OBS Overlay" },
      {
        name: "description",
        content:
          "Transparent OBS browser source that shows viewer reactions and live viewer count in real time.",
      },
      { property: "og:title", content: "PulseLive Dashboard — OBS Overlay" },
      {
        property: "og:description",
        content: "Real-time reaction overlay for TikTok Live, built for OBS browser sources.",
      },
    ],
  }),
  component: LiveDashboard,
});

const POPUP_LIFETIME_MS = 3000;

function LiveDashboard() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [scare, setScare] = useState<LiveEvent | null>(null);
  const [joinedAt] = useState(() => Date.now());
  const audioRef = useRef<AudioContext | null>(null);

  const identity = useMemo<PresenceState>(
    () => ({ username: "streamer", role: "streamer", joinedAt }),
    [joinedAt],
  );

  const playTone = useCallback((frequency: number) => {
    if (typeof window === "undefined") return;
    try {
      audioRef.current ??= new AudioContext();
      const ctx = audioRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = frequency < 200 ? "sawtooth" : "triangle";
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.45);
    } catch {
      /* audio is best-effort in OBS */
    }
  }, []);

  const handleInteraction = useCallback(
    (payload: InteractionPayload) => {
      const definition = getAction(payload.action);
      const event: LiveEvent = {
        ...payload,
        id: `${payload.username}-${payload.sentAt}-${Math.round(Math.random() * 1e6)}`,
      };

      playTone(definition.tone);
      setEvents((current) => [...current, event].slice(-12));
      if (definition.dramatic) setScare(event);

      window.setTimeout(() => {
        setEvents((current) => current.filter((item) => item.id !== event.id));
        setScare((current) => (current?.id === event.id ? null : current));
      }, POPUP_LIFETIME_MS);
    },
    [playTone],
  );

  const { connected, viewerCount } = useLiveChannel({
    identity,
    onInteraction: handleInteraction,
  });

  // Transparent background for OBS browser sources.
  useEffect(() => {
    const { body, documentElement } = document;
    const previous = body.style.backgroundColor;
    body.style.backgroundColor = "transparent";
    documentElement.style.backgroundColor = "transparent";
    return () => {
      body.style.backgroundColor = previous;
      documentElement.style.backgroundColor = "";
    };
  }, []);

  return (
    <div
      className={`pointer-events-none relative h-screen w-screen overflow-hidden ${
        scare ? "animate-shake" : ""
      }`}
    >
      <div className="absolute left-6 top-6 flex items-center gap-3 rounded-full border border-border/60 bg-card/70 px-4 py-2 backdrop-blur-md">
        <span
          className={`size-2.5 rounded-full ${connected ? "bg-primary" : "bg-muted-foreground"}`}
          aria-hidden
        />
        <Users className="size-4 text-secondary" aria-hidden />
        <span className="text-lg font-black tabular-nums text-foreground">{viewerCount}</span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">live viewers</span>
      </div>

      <div className="absolute bottom-8 left-6 flex w-[26rem] flex-col-reverse gap-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="animate-float-up flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 backdrop-blur-md"
            style={{ boxShadow: "var(--stage-glow)" }}
          >
            <span className="text-3xl" aria-hidden>
              {event.emoji}
            </span>
            <p className="text-base font-bold text-foreground">
              {event.username}
              <span className="ml-2 font-medium text-muted-foreground">
                sent {event.emoji}
              </span>
            </p>
          </div>
        ))}
      </div>

      {scare ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/25 backdrop-blur-sm">
          <span className="animate-pop-in text-[12rem] leading-none" aria-hidden>
            {scare.emoji}
          </span>
          <p className="animate-pop-in text-3xl font-black uppercase tracking-widest text-foreground">
            {scare.username} scared you!
          </p>
        </div>
      ) : null}
    </div>
  );
}
