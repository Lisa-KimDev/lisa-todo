import { FormEvent, useMemo, useState } from 'react';

export type Todo = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  completed: boolean;
  completed_at: string | null;
};

type TodoItemProps = {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onUpdateTitle: (todoId: string, title: string) => void;
  onDelete: (todoId: string) => void;
};

export default function TodoItem({
  todo,
  onToggle,
  onUpdateTitle,
  onDelete,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);
  const relativeDate = useMemo(() => formatRelativeDate(todo.created_at), [todo.created_at]);

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = draftTitle.trim();

    if (trimmedTitle) {
      onUpdateTitle(todo.id, trimmedTitle);
      setEditing(false);
    }
  }

  function cancelEdit() {
    setDraftTitle(todo.title);
    setEditing(false);
  }

  return (
    <li className="rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/20">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(todo)}
          aria-label={todo.completed ? 'Mark task incomplete' : 'Mark task complete'}
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition focus:outline-none focus:ring-2 focus:ring-lisa-yellow focus:ring-offset-2 focus:ring-offset-lisa-black ${
            todo.completed
              ? 'border-lisa-yellow bg-lisa-yellow text-lisa-black'
              : 'border-white/30 text-transparent hover:border-lisa-yellow'
          }`}
        >
          <span className="text-sm font-black">✓</span>
        </button>

        <div className="min-w-0 flex-1">
          {editing ? (
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleEditSubmit}>
              <input
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    cancelEdit();
                  }
                }}
                className="min-h-10 flex-1 rounded-md border border-lisa-yellow bg-black px-3 text-lisa-white outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-md bg-lisa-yellow px-4 py-2 text-sm font-black text-lisa-black transition hover:bg-white"
              >
                Save
              </button>
            </form>
          ) : (
            <button
              type="button"
              onDoubleClick={() => setEditing(true)}
              className={`block w-full text-left text-base font-semibold leading-6 transition ${
                todo.completed ? 'text-white/45 line-through' : 'text-lisa-white'
              }`}
            >
              {todo.title}
            </button>
          )}

          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-white/35">
            {relativeDate}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDraftTitle(todo.title);
              setEditing(true);
            }}
            aria-label="Edit task"
            className="rounded-md border border-white/10 p-2 text-white/60 transition hover:border-lisa-yellow hover:text-lisa-yellow focus:outline-none focus:ring-2 focus:ring-lisa-yellow focus:ring-offset-2 focus:ring-offset-lisa-black"
          >
            <span aria-hidden="true">✎</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            aria-label="Delete task"
            className="rounded-md border border-white/10 p-2 text-white/60 transition hover:border-red-300 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-lisa-black"
          >
            <span aria-hidden="true">⌫</span>
          </button>
        </div>
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

  if (diffSeconds < 60) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}
