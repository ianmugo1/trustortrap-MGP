import { Inbox } from "lucide-react";
import Button from "./Button";

export default function EmptyState({ title="Nothing here yet", subtitle="Start by creating something new.", action, onAction }) {
  return (
    <div className="text-center py-10">
      <Inbox className="mx-auto mb-3" />
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[color:var(--muted)] mb-4">{subtitle}</p>
      {action && <Button onClick={onAction}>{action}</Button>}
    </div>
  );
}
