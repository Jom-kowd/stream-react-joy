import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  BROADCAST_EVENT,
  CHANNEL_NAME,
  type InteractionPayload,
  type PresenceState,
} from "@/lib/interactions";

interface UseLiveChannelOptions {
  /** Presence identity; pass null to stay disconnected. */
  identity: PresenceState | null;
  /** Called for every broadcast interaction received. */
  onInteraction?: (payload: InteractionPayload) => void;
}

interface UseLiveChannelResult {
  connected: boolean;
  viewerCount: number;
  send: (payload: InteractionPayload) => Promise<void>;
}

/**
 * Wires a single Realtime channel used for both Broadcast (interactions)
 * and Presence (live viewer count). No database writes involved.
 */
export function useLiveChannel({
  identity,
  onInteraction,
}: UseLiveChannelOptions): UseLiveChannelResult {
  const [connected, setConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const handlerRef = useRef(onInteraction);
  handlerRef.current = onInteraction;

  const identityKey = identity
    ? `${identity.role}:${identity.username}:${identity.joinedAt}`
    : null;

  useEffect(() => {
    if (!identity || !identityKey) return;

    const channel = supabase.channel(CHANNEL_NAME, {
      config: { broadcast: { self: false }, presence: { key: identityKey } },
    });

    channel
      .on("broadcast", { event: BROADCAST_EVENT }, ({ payload }) => {
        handlerRef.current?.(payload as InteractionPayload);
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceState>();
        const viewers = Object.values(state)
          .flat()
          .filter((entry) => entry.role === "viewer");
        setViewerCount(viewers.length);
      })
      .subscribe(async (status) => {
        const isJoined = status === "SUBSCRIBED";
        setConnected(isJoined);
        if (isJoined) await channel.track(identity);
      });

    channelRef.current = channel;

    return () => {
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identityKey]);

  const send = useCallback(async (payload: InteractionPayload) => {
    const channel = channelRef.current;
    if (!channel) return;
    await channel.send({
      type: "broadcast",
      event: BROADCAST_EVENT,
      payload,
    });
  }, []);

  return { connected, viewerCount, send };
}
