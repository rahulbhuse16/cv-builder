import type { ChangeEvent } from "react";

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function HtmlEditor({
  value,
  onChange,
}: HtmlEditorProps) {

  const handleChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    onChange(event.target.value);
  };

  return (
    <div className="flex h-full flex-col">

      <div className="border-b border-slate-200 bg-white px-4 py-3">

        <h2 className="font-semibold text-slate-900">
          HTML Editor
        </h2>

        <p className="text-xs text-slate-500">
          Enter ATS-friendly CV HTML
        </p>

      </div>

      <textarea
        value={value}
        onChange={handleChange}
        spellCheck={false}
        className="
          min-h-0
          flex-1
          resize-none
          bg-slate-950
          p-5
          font-mono
          text-sm
          leading-6
          text-slate-100
          outline-none
        "
        placeholder="<h1>Your Name</h1>"
      />

    </div>
  );
}