type ThemeToggleProps = {
  dark: boolean;
  onToggle: () => void;
};

export default function ThemeToggle({ dark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-black/15 dark:border-white/15 text-lg transition hover:border-lisa-yellow hover:text-lisa-yellow focus:outline-none focus:ring-2 focus:ring-lisa-yellow"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
