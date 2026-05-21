import { FormEvent, useMemo, useState } from 'react';

export type Category = 'general' | 'work' | 'personal' | 'crypto' | 'urgent';

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'general', label: 'General', emoji: '📋' },
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'personal', label: 'Personal', emoji: '🏠' },
  { value: 'crypto', label: 'Crypto', emoji: '₿' },
  { value: 'urgent', label: 'Urgent', emoji: '🔥' },
];

export function getCategoryInfo(cat: string) {
  return CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[0];
}

export type Todo = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  completed: boolean;
  completed_at: string | null;
  category: Category;
  due_date: string | null;
};

type TodoItemProps = {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onUpdate: (todoId: string, updates: Partial<Todo>) => void;
  onDelete: (todoId: string) => void;
};

export default function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);
  const [draftCategory, setDraftCategory] = useState<Category>(todo.category);
  const [draftDueDate, setDraftDueDate] = useState(todo.due_date ?? '');
  const relativeDate = useMemo(() => formatRelativeDate(todo.created_at), [todo.created_at]);
  const dueInfo = useMemo(() => formatDueDate(todo.due_date), [todo.due_date]);
  const catInfo = getCategoryInfo(todo.category);

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) return;

    const updates: Partial<Todo> = { title: trimmedTitle, category: draftCategory };
    if (draftDueDate) updates.due_date = draftDueDate;
    else updates.due_date = null;

    onUpdate(todo.id, updates);
    setEditing(false);
  }

  function cancelEdit() {
    setDraftTitle(todo.title);
    setDraftCategory(todo.category);
    setDraftDueDate(todo.due_date ?? '');
    setEditing(false);
  }

  const selectCls =
    'rounded-md border border-lisa-yellow bg-gray-100 dark:bg-black px-3 py-2 text-sm outline-none text-lisa-black dark:text-lisa-white';

  return (
    <li className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] p-4 transition hover:border-black/20 dark:hover:border-white/20">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(todo)}
          aria-label={todo.completed ? 'Mark task incomplete' : 'Mark task complete'}
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition focus:outline-none focus:ring-2 focus:ring-lisa-yellow ${
            todo.completed
              ? 'border-lisa-yellow bg-lisa-yellow text-lisa-black'
              : 'border-black/30 dark:border-white/30 text-transparent hover:border-lisa-yellow'
          }`}
        >
          <span className="text-sm font-black">✓</span>
        </button>

        <div className="min-w-0 flex-1">
          {editing ? (
            <form className="flex flex-col gap-3" onSubmit={handleEditSubmit}>
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit(); }}
                className="min-h-10 w-full rounded-md border border-lisa-yellow bg-gray-100 dark:bg-black px-3 text-lisa-black dark:text-lisa-white outline-none"
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                <select value={draftCategory} onChange={(e) => setDraftCategory(e.target.value as Category)} className={selectCls}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={draftDueDate}
                  onChange={(e) => setDraftDueDate(e.target.value)}
                  className={selectCls}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="rounded-md bg-lisa-yellow px-4 py-2 text-sm font-black text-lisa-black transition hover:bg-lisa-yellow/80">Save</button>
                <button type="button" onClick={cancelEdit} className="rounded-md border border-black/20 dark:border-white/20 px-4 py-2 text-sm font-semibold transition hover:border-lisa-yellow hover:text-lisa-yellow">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <button
                type="button"
                onDoubleClick={() => setEditing(true)}
                className={`block w-full text-left text-base font-semibold leading-6 transition ${
                  todo.completed ? 'text-black/40 dark:text-white/45 line-through' : 'text-lisa-black dark:text-lisa-white'
                }`}
              >
                {todo.title}
              </button>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-black/10 dark:border-white/10 px-2 py-0.5 text-xs font-medium text-black/50 dark:text-white/50">
                  {catInfo.emoji} {catInfo.label}
                </span>
                {dueInfo && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                    dueInfo.overdue
                      ? 'border-red-300 dark:border-red-400/40 text-red-600 dark:text-red-300'
                      : 'border-black/10 dark:border-white/10 text-black/50 dark:text-white/50'
                  }`}>
                    📅 {dueInfo.label}
                  </span>
                )}
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-black/30 dark:text-white/35">
                  {relativeDate}
                </span>
              </div>
            </>
          )}
        </div>

        {!editing && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(todo.title); }}
              aria-label="Copy task"
              className="rounded-md border border-black/10 dark:border-white/10 p-2 text-black/50 dark:text-white/60 transition hover:border-lisa-yellow hover:text-lisa-yellow focus:outline-none focus:ring-2 focus:ring-lisa-yellow"
            >
              <span aria-hidden="true">📋</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftTitle(todo.title);
                setDraftCategory(todo.category);
                setDraftDueDate(todo.due_date ?? '');
                setEditing(true);
              }}
              aria-label="Edit task"
              className="rounded-md border border-black/10 dark:border-white/10 p-2 text-black/50 dark:text-white/60 transition hover:border-lisa-yellow hover:text-lisa-yellow focus:outline-none focus:ring-2 focus:ring-lisa-yellow"
            >
              <span aria-hidden="true">✎</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(todo.id)}
              aria-label="Delete task"
              className="rounded-md border border-black/10 dark:border-white/10 p-2 text-black/50 dark:text-white/60 transition hover:border-red-300 hover:text-red-500 dark:hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <span aria-hidden="true">⌫</span>
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

function formatDueDate(value: string | null): { label: string; overdue: boolean } | null {
  if (!value) return null;
  const due = new Date(value + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)}d`, overdue: true };
  if (diffDays === 0) return { label: 'Due today', overdue: true };
  if (diffDays === 1) return { label: 'Due tomorrow', overdue: false };
  if (diffDays <= 7) return { label: `Due in ${diffDays}d`, overdue: false };

  return {
    label: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    overdue: false,
  };
}
