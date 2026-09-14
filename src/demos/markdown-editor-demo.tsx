import { useState } from "react";
import { MarkdownEditor } from "@/components/devere-ui/markdown-editor";

const SAMPLE = `## Portfolio update

Thanks **{{first_name}}**, here is the latest note.

- Revenue is up this quarter
- Costs remain in line with the plan

[!button Open report](https://example.com)
`;

const VARIABLES = [
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "company", label: "Company" },
] as const;

function MarkdownEditorDemo() {
  const [value, setValue] = useState(SAMPLE);

  return (
    <MarkdownEditor
      className="w-full"
      onChange={setValue}
      placeholder="Write markdown…"
      value={value}
      variables={VARIABLES}
    />
  );
}

export { MarkdownEditorDemo };
