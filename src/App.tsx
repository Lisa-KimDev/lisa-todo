import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import Login from './components/Login';
import TodoList from './components/TodoList';
import { supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-lisa-black px-4 text-lisa-white">
        <p className="text-sm uppercase tracking-[0.24em] text-lisa-yellow">Loading</p>
      </main>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <main className="min-h-screen bg-lisa-black px-4 py-6 text-lisa-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black tracking-wide text-lisa-yellow sm:text-4xl">
            LISA TODO
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-lisa-white transition hover:border-lisa-yellow hover:text-lisa-yellow focus:outline-none focus:ring-2 focus:ring-lisa-yellow focus:ring-offset-2 focus:ring-offset-lisa-black"
          >
            Logout
          </button>
        </header>

        <TodoList userId={session.user.id} />
      </div>
    </main>
  );
}
