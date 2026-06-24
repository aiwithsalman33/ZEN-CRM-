import React from 'react';
import { Avatar } from './Avatar';
import { useTeam } from '@/store/selectors';

/** Avatar + name for a team member id, optionally showing presence dot. */
export const AgentAvatar: React.FC<{
  agentId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showName?: boolean;
  showStatus?: boolean;
  firstNameOnly?: boolean;
}> = ({ agentId, size = 'sm', showName = true, showStatus = false, firstNameOnly = true }) => {
  const { byId, nameOf } = useTeam();
  const m = byId(agentId);
  const name = nameOf(agentId);
  return (
    <div className="inline-flex items-center gap-1.5">
      <Avatar name={name} size={size} presence={showStatus ? m?.presence : undefined} />
      {showName && <span className="text-sm text-ink truncate">{firstNameOnly ? name.split(' ')[0] : name}</span>}
    </div>
  );
};
