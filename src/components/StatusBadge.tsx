import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { priorityTone, statusTone } from '@/lib/requestStatus';
import { humanize } from '@/utils/format';
import type { RequestPriority, RequestStatus } from '@/types/maintenance';

export function StatusBadge({ status }: { status: RequestStatus }) {
  const { t } = useTranslation();
  return (
    <Badge tone={statusTone(status)}>
      {t(`requestStatus.${status}`, { defaultValue: humanize(status) })}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority?: RequestPriority | null }) {
  const { t } = useTranslation();
  if (!priority || priority === 'normal' || priority === 'low') return null;
  return (
    <Badge tone={priorityTone(priority)}>
      {t(`priority.${priority}`, { defaultValue: humanize(priority) })}
    </Badge>
  );
}
