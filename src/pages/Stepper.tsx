import type { Page } from "../App";

const STEPS: { id: Page; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "preview", label: "Preview" },
  { id: "export", label: "Export" },
];

interface Props {
  current: Page;
  hasDoc: boolean;
  onNavigate: (page: Page) => void;
}

export default function Stepper({ current, hasDoc, onNavigate }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center gap-2">
        {STEPS.map((step, i) => {
          const active = i === currentIndex;
          const done = i < currentIndex;
          const enabled = i === 0 || hasDoc;

          return (
            <li key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!enabled}
                onClick={() => onNavigate(step.id)}
                aria-current={active ? "step" : undefined}
                className={[
                  "flex items-center gap-2 rounded-full px-2 py-1 text-sm font-medium",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  active ? "text-slate-900" : "text-slate-500",
                  enabled ? "hover:text-slate-900" : "cursor-not-allowed opacity-50",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    active
                      ? "bg-indigo-600 text-white"
                      : done
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-600",
                  ].join(" ")}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span className="h-px w-6 bg-slate-300 sm:w-10" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}