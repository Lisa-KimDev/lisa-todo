import { FormEvent, useCallback, useEffect, useState } from 'react';
import TodoItem, { Todo } from './TodoItem';
import { supabase } from '../lib/supabase';

type TodoListProps = {
  userId: string;
};

export default function TodoList({ userId }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data, error: fetchError } = await supabase
      .from('todos')
      .select('id,title,created_at,completed,completed_at,user_id')
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setTodos(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  async function handleAddTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();

    if (!title) {
      return;
    }

    setSaving(true);
    setError('');

    const { data, error: insertError } = await supabase
      .from('todos')
      .insert({ title, user_id: userId })
      .select('id,title,created_at,completed,completed_at,user_id')
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTodos((current) => [data, ...current]);
    setNewTitle('');
  }

  async function handleToggle(todo: Todo) {
    const completed = !todo.completed;
    const completedAt = completed ? new Date().toISOString() : null;

    const { error: updateError } = await supabase
      .from('todos')
      .update({ completed, completed_at: completedAt })
      .eq('id', todo.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setTodos((current) =>
      sortTodos(
        current.map((item) =>
          item.id === todo.id
            ? { ...item, completed, completed_at: completedAt }
            : item,
        ),
      ),
    );
  }

  async function handleUpdateTitle(todoId: string, title: string) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    const { error: updateError } = await supabase
      .from('todos')
      .update({ title: trimmedTitle })
      .eq('id', todoId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setTodos((current) =>
      current.map((todo) =>
        todo.id === todoId ? { ...todo, title: trimmedTitle } : todo,
      ),
    );
  }

  async function handleDelete(todoId: string) {
    const { error: deleteError } = await supabase.from('todos').delete().eq('id', todoId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setTodos((current) => current.filter((todo) => todo.id !== todoId));
  }

  return (
    <section className="flex flex-col gap-5">
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="Add a task"
          className="min-h-12 flex-1 rounded-md border border-white/15 bg-white/[0.04] px-4 text-lisa-white outline-none transition placeholder:text-white/35 focus:border-lisa-yellow focus:ring-2 focus:ring-lisa-yellow/25"
        />
        <button
          type="submit"
          disabled={saving}
          className="min-h-12 rounded-md bg-lisa-yellow px-6 font-black text-lisa-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Adding...' : 'Add'}
        </button>
      </form>

      {error ? (
        <p className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="py-10 text-center text-sm uppercase tracking-[0.22em] text-white/50">
          Loading tasks
        </p>
      ) : todos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/15 px-5 py-10 text-center text-white/50">
          No tasks yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onUpdateTitle={handleUpdateTitle}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function sortTodos(todos: Todo[]) {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
