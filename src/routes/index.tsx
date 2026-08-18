import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Radio, Users, Send } from "lucide-react";
import { useLiveChannel } from "@/hooks/use-live-channel";
import {
  ACTIONS,
  sanitizeUsername,
  type ActionDefinition,
  type PresenceState,
} from "@/lib/interactions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulseLive — Tap to React on the Live Stream" },
      {
        name: "description",
        content:
          "Join the stream, pick a name and fire off instant reactions that pop up live on the streamer's screen.",
      },
      { property: "og:title", content: "PulseLive — Tap to React on the Live Stream" },
      {
        property: "og:description",
        content: "Send 🔥, 💖 and jump scares straight to the live broadcast in real time.",
      },
    ],
  }),
  component: ViewerPage,
});

function ViewerPage() {
  const [draftName, setDraftName] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [joinedAt] = useState(() => Date.now());
  const [lastSent, setLastSent] = useState<string | null>(null);

  const identity = useMemo<PresenceState | null>(
    () => (username ? { username, role: "viewer", joinedAt } : null),
    [username, joinedAt],
  );

  const { connected, viewerCount, send } = useLiveChannel({ identity });

  const handleSend = useCallback(
    async (action: ActionDefinition) => {
      if (!username) return;
      setLastSent(`${action.emoji}-${Date.now()}`);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(35);
      }
      await send({
        username,
        action: action.id,
        emoji: action.emoji,
        sentAt: Date.now(),
      });
    },
    [send, username],
  );

  if (!username) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
            PulseLive
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-foreground">
            Take over the
            <span
              className="ml-2 bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-hype)" }}
            >
              live screen
            </span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Pick a temporary name. Your reactions appear on stream instantly.
          </p>
        </div>

        <form
          className="w-full max-w-sm space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const clean = sanitizeUsername(draftName);
            if (clean.length >= 2) setUsername(clean);
          }}
        >
          <input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Your name on stream"
            maxLength={20}
            aria-label="Temporary username"
            className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
          <button
            type="submit"
            disabled={sanitizeUsername(draftName).length < 2}
            className="w-full rounded-2xl px-5 py-4 text-base font-bold text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
            style={{ backgroundImage: "var(--gradient-hype)" }}
          >
            Join the live room
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-8">
      <header className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Reacting as</p>
          <p className="text-lg font-bold text-foreground">{username}</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-4" aria-hidden />
            {viewerCount}
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              connected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            <Radio className="size-3.5" aria-hidden />
            {connected ? "LIVE" : "Connecting"}
          </span>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => handleSend(action)}
            className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-3xl border border-border bg-card transition-transform active:scale-90 ${
              action.dramatic ? "animate-pulse-glow border-primary/50" : ""
            }`}
          >
            <span className="text-5xl" aria-hidden>
              {action.emoji}
            </span>
            <span className="text-sm font-semibold text-foreground">{action.label}</span>
          </button>
        ))}
      </section>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <Send className="size-3.5" aria-hidden />
        {lastSent ? "Reaction sent to the stream!" : "Tap anything — it lands on stream instantly."}
      </p>
    </main>
  );
}
