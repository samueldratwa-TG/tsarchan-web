interface CodeBlockProps {
  children: React.ReactNode;
}

export function CodeBlock({ children }: CodeBlockProps) {
  return (
    <pre className="my-6 overflow-x-auto rounded-xl bg-bg-tertiary p-4 text-sm leading-relaxed">
      <code className="font-mono">{children}</code>
    </pre>
  );
}
