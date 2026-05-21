import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Enter your email address.');
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-lisa-black px-4 py-10 text-lisa-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.03] p-6 shadow-glow sm:p-8">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-lisa-yellow">
          LISA TODO
        </p>
        <h1 className="text-3xl font-black">Sign in with email</h1>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Enter your email and Supabase will send a passwordless magic link.
        </p>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-semibold text-white/80">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="rounded-md border border-white/15 bg-black px-4 py-3 text-base text-lisa-white outline-none transition placeholder:text-white/35 focus:border-lisa-yellow focus:ring-2 focus:ring-lisa-yellow/30"
              autoComplete="email"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-lisa-yellow px-4 py-3 font-black text-lisa-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        {sent ? (
          <p className="mt-5 rounded-md border border-lisa-yellow/30 bg-lisa-yellow/10 px-4 py-3 text-sm font-semibold text-lisa-yellow">
            Check your email for the magic link.
          </p>
        ) : null}

        {error ? (
          <p className="mt-5 rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
