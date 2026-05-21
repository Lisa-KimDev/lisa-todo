import { FormEvent, useCallback, useEffect, useState } from 'react';
import TodoItem, { Category, CATEGORIES, Todo } from './TodoItem';
import { supabase } from '../lib/supabase';

type TodoListProps = {
  userId: string;
};

type FilterCategory = 'all' | Category;

export default function TodoList({ userId }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('general');
  const [newDueDate, setNewDueDate] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data, error: fetchError } = await supabase
      .from('todos')
      .select('id,title,created_at,completed,completed_at,user_id,category,due_date')
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setTodos((data ?? []) as Todo[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  async function handleAddTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setSaving(true);
    setError('');

    const insert: Record<string, unknown> = { title, user_id: userId, category: newCategory };
    if (newDueDate) insert.due_date = newDueDate;

    const { data, error: insertError } = await supabase
      .from('todos')
      .insert(insert)
      .select('id,title,created_at,completed,completed_at,user_id,category,due_date')
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTodos((current) => sortTodos([data, ...current]));
    setNewTitle('');
    setNewDueDate('');
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
          item.id === todo.id ? { ...item, completed, completed_at: completedAt } : item,
        ) as Todo[],
      ),
    );
  }

  async function handleUpdate(todoId: string, updates: Partial<Todo>) {
    const { error: updateError } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', todoId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setTodos((current) =>
      current.map((todo) =>
        todo.id === todoId ? { ...todo, ...updates } : todo,
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

  const filteredTodos = filterCategory === 'all'
    ? todos
    : todos.filter((t) => t.category === filterCategory);

  const inputCls =
    'rounded-md border border-black/15 dark:border-white/15 bg-gray-100 dark:bg-white/[0.04] px-4 text-lisa-black dark:text-lisa-white outline-none transition placeholder:text-black/35 dark:placeholder:text-white/35 focus:border-lisa-yellow focus:ring-2 focus:ring-lisa-yellow/25';
  const selectCls =
    'rounded-md border border-black/15 dark:border-white/15 bg-gray-100 dark:bg-white/[0.04] px-3 py-3 text-sm text-lisa-black dark:text-lisa-white outline-none focus:border-lisa-yellow';

  return (
    <section className="flex flex-col gap-5">
      {/* Add task form */}
      <form className="flex flex-col gap-3" onSubmit={handleAddTodo}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a task"
            className={`min-h-12 flex-1 ${inputCls}`}
          />
          <button
            type="submit"
            disabled={saving}
            className="min-h-12 rounded-md bg-lisa-yellow px-6 font-black text-lisa-black transition hover:bg-lisa-yellow/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Adding...' : 'Add'}
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as Category)} className={selectCls}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className={selectCls}
            placeholder="Due date"
          />
        </div>
      </form>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterCategory('all')}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            filterCategory === 'all'
              ? 'border-lisa-yellow bg-lisa-yellow text-lisa-black'
              : 'border-black/15 dark:border-white/15 text-black/50 dark:text-white/50 hover:border-lisa-yellow hover:text-lisa-yellow'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setFilterCategory(c.value)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              filterCategory === c.value
                ? 'border-lisa-yellow bg-lisa-yellow text-lisa-black'
                : 'border-black/15 dark:border-white/15 text-black/50 dark:text-white/50 hover:border-lisa-yellow hover:text-lisa-yellow'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-600 dark:text-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm uppercase tracking-[0.22em] text-black/40 dark:text-white/50">
          Loading tasks
        </p>
      ) : filteredTodos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-black/15 dark:border-white/15 px-5 py-10 text-center text-black/40 dark:text-white/50">
          {filterCategory === 'all' ? 'No tasks yet.' : `No ${filterCategory} tasks.`}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
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
    if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
