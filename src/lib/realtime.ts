/**
 * Realtime Messaging Abstraction Layer.
 * Current implementation uses lightweight HTTP polling backed by SWR with adaptive intervals:
 * - Open chat room: 3-4s
 * - Inbox list: 10s
 * - Notification count: 25s
 * - Pauses polling when browser tab is in background (refreshWhenHidden: false).
 *
 * To swap polling for WebSockets, Server-Sent Events, or external pub/sub providers
 * (such as Pusher, Ably, or Supabase Realtime):
 * 1. Implement this interface for your provider.
 * 2. Connect client subscribers to channel `presence-conversation-${conversationId}`.
 * 3. Publish message events in `src/app/actions/chat.ts` upon message creation.
 */

export interface RealtimeProvider {
  publish(channel: string, event: string, payload: any): Promise<void>;
}

class PollingRealtimeProvider implements RealtimeProvider {
  async publish(channel: string, event: string, payload: any): Promise<void> {
    // In polling mode, database writes automatically satisfy subsequent client polls.
  }
}

export const realtime = new PollingRealtimeProvider();
