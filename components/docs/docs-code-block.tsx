import { CopyButton } from "./copy-button";

interface DocsCodeBlockProps {
  code: string;
  label: string;
}

export function DocsCodeBlock({ code, label }: DocsCodeBlockProps) {
  return (
    <div className="relative mt-4 overflow-hidden rounded-lg border bg-muted/40">
      <div className="flex h-10 items-center justify-between border-b px-4">
        <span className="font-mono text-muted-foreground text-xs">{label}</span>
        <CopyButton label={label} text={code} />
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 text-sm leading-6">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
