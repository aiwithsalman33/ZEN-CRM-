import { useCallback } from 'react';
import { useStore } from './store';
import type { Activity, ActivityType, AppNotification, NotificationType } from '@/types';
import { uid } from '@/lib/utils';

/** Look up a team member by id. */
export function useTeam() {
  const { state } = useStore();
  const byId = (id: string) => state.team.find((m) => m.id === id);
  const nameOf = (id: string) => byId(id)?.name ?? 'Unassigned';
  return { team: state.team, byId, nameOf };
}

export function usePipelines() {
  const { state } = useStore();
  return {
    pipelines: state.pipelines,
    byId: (id: string) => state.pipelines.find((p) => p.id === id),
  };
}

/** Activities for a given entity, newest first. */
export function useEntityActivities(entityType: Activity['entityType'], entityId: string) {
  const { state } = useStore();
  return state.activities
    .filter((a) => a.entityType === entityType && a.entityId === entityId)
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

/** Append an activity to the timeline (and optionally toast). */
export function useActivityLog() {
  const { dispatch, state } = useStore();
  return useCallback(
    (entityType: Activity['entityType'], entityId: string, type: ActivityType, title: string, description?: string) => {
      const activity: Activity = {
        id: uid('act'),
        type,
        entityType,
        entityId,
        title,
        description,
        agentId: state.currentUserId,
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: 'ADD', key: 'activities', item: activity, prepend: true });
      // also bump the entity's lastActivity if it has one
      if (entityType === 'lead') dispatch({ type: 'UPDATE', key: 'leads', id: entityId, patch: { lastActivity: activity.timestamp } });
      if (entityType === 'deal') dispatch({ type: 'UPDATE', key: 'deals', id: entityId, patch: { lastActivity: activity.timestamp } });
      if (entityType === 'contact') dispatch({ type: 'UPDATE', key: 'contacts', id: entityId, patch: { lastActivity: activity.timestamp } });
    },
    [dispatch, state.currentUserId],
  );
}

/** Push a new in-app notification. */
export function useNotify() {
  const { dispatch } = useStore();
  return useCallback(
    (type: NotificationType, message: string, link?: string) => {
      const n: AppNotification = { id: uid('n'), type, message, timestamp: new Date().toISOString(), read: false, link };
      dispatch({ type: 'ADD', key: 'notifications', item: n, prepend: true });
    },
    [dispatch],
  );
}
