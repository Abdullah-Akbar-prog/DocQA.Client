import { CircleAlert, CircleCheck, Clock, LoaderCircle } from 'lucide-react';
import type { DocumentStatus } from '../../api/types';

const ICONS = {
  Pending: <Clock size={12} />,
  Processing: <LoaderCircle size={12} className="spin" />,
  Ready: <CircleCheck size={12} />,
  Failed: <CircleAlert size={12} />,
} satisfies Record<DocumentStatus, React.ReactNode>;

export function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      {ICONS[status]} {status}
    </span>
  );
}