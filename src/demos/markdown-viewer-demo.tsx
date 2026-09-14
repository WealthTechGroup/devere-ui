import { MarkdownViewer } from "@/components/devere-ui/markdown-viewer";

const SAMPLE = `## Portfolio update

Thanks **Alex**, here is the latest note.

- Revenue is up this quarter
- Costs remain in line with the plan

Read the [full report](https://example.com) or open it below.

[!button Open report](https://example.com)
`;

function MarkdownViewerDemo() {
  return (
    <div className="w-full rounded-2xl border bg-background p-4">
      <MarkdownViewer>{SAMPLE}</MarkdownViewer>
    </div>
  );
}

export { MarkdownViewerDemo };
