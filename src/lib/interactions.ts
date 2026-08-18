/**
 * Shared, strictly typed contract for the realtime interaction layer.
 * Nothing here touches the database: everything travels over Realtime
 * Broadcast (events) and Presence (live viewer count).
 */

export const CHANNEL_NAME = "tiktok-live-room" as const;
export const BROADCAST_EVENT = "interaction" as const;

export type ActionId = "fire" | "heart" | "laugh" | "clap" | "jumpscare" | "hype";

export interface ActionDefinition {
  id: ActionId;
  emoji: string;
  label: string;
  /** Frequency used by the dashboard's WebAudio blip. */
  tone: number;
  /** Screen-shaking, full-screen takeover reaction. */
  dramatic?: boolean;
}

export const ACTIONS: readonly ActionDefinition[] = [
  { id: "fire", emoji: "🔥", label: "Send Fire", tone: 660 },
  { id: "heart", emoji: "💖", label: "Send Love", tone: 880 },
  { id: "laugh", emoji: "😂", label: "Send Laugh", tone: 520 },
  { id: "clap", emoji: "👏", label: "Applause", tone: 440 },
  { id: "hype", emoji: "🚀", label: "Hype Train", tone: 990 },
  { id: "jumpscare", emoji: "👻", label: "Jump Scare", tone: 120, dramatic: true },
] as const;

export interface InteractionPayload {
  username: string;
  action: ActionId;
  emoji: string;
  /** Client timestamp in ms; used only for ordering/keys. */
  sentAt: number;
}

export interface PresenceState {
  username: string;
  role: "viewer" | "streamer";
  joinedAt: number;
}

export interface LiveEvent extends InteractionPayload {
  id: string;
}

export function getAction(id: ActionId): ActionDefinition {
  return ACTIONS.find((a) => a.id === id) ?? ACTIONS[0];
}

export function sanitizeUsername(raw: string): string {
  return raw.trim().slice(0, 20);
}
