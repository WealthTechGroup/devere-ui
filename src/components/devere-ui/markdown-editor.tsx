import {
  BoldIcon,
  Heading2Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MonitorPlayIcon,
  MousePointerClickIcon,
  VariableIcon,
} from "lucide-react";
import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/devere-ui/button";
import { MarkdownViewer } from "@/components/devere-ui/markdown-viewer";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/devere-ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type MarkdownEditorVariable = {
  key: string;
  label: string;
};

export type MarkdownEditorFeatures = {
  bold?: boolean;
  italic?: boolean;
  heading?: boolean;
  bulletList?: boolean;
  numberedList?: boolean;
  link?: boolean;
  youtube?: boolean;
  button?: boolean;
};

const DEFAULT_FEATURES: Required<MarkdownEditorFeatures> = {
  bold: true,
  bulletList: true,
  button: true,
  heading: true,
  italic: true,
  link: true,
  numberedList: true,
  youtube: true,
};

const CTA_BUTTON_SNIPPET = "[!button Click here](https://example.com)";

type StyleArgs = {
  prefix?: string;
  suffix?: string;
  multiline?: boolean;
  surroundWithNewlines?: boolean;
  orderedList?: boolean;
  unorderedList?: boolean;
  trimFirst?: boolean;
  replaceNext?: string;
  scanFor?: string;
  blockPrefix?: string;
  blockSuffix?: string;
};

type EditResult = {
  next: string;
  selectionStart: number;
  selectionEnd: number;
};

const ORDERED_LIST_RE = /^\d+\.\s+/;
const UNORDERED_LIST_PREFIX = "- ";
const LIST_ITEM_RE = /^(\s*)([-*+]|\d+\.)\s(.*)$/;
const ORDERED_MARKER_RE = /^\d+\.$/;
const HEADING_PREFIX_RE = /^#{1,6}\s+/;
const WHITESPACE_RE = /\s/;
const NEWLINE_RE = /\n/;
const TRAILING_NEWLINES_RE = /\n*$/;
const LEADING_NEWLINES_RE = /^\n*/;
const NON_WHITESPACE_RE = /\S/;
const EDGE_WHITESPACE_RE = /^\s*|\s*$/g;

function isMultipleLines(string: string): boolean {
  return string.trim().split("\n").length > 1;
}

function wordSelectionStart(text: string, i: number): number {
  let index = i;
  while (
    text[index] &&
    text[index - 1] !== null &&
    !WHITESPACE_RE.test(text[index - 1])
  ) {
    index -= 1;
  }
  return index;
}

function wordSelectionEnd(text: string, i: number, multiline: boolean): number {
  let index = i;
  const breakpoint = multiline ? NEWLINE_RE : WHITESPACE_RE;
  while (text[index] && !breakpoint.test(text[index])) {
    index += 1;
  }
  return index;
}

function expandSelectionToLine(
  value: string,
  selectionStart: number,
  selectionEnd: number
): { selectionStart: number; selectionEnd: number } {
  const lines = value.split("\n");
  let counter = 0;
  let start = selectionStart;
  let end = selectionEnd;

  for (const line of lines) {
    const lineLength = line.length + 1;
    if (selectionStart >= counter && selectionStart < counter + lineLength) {
      start = counter;
    }
    if (selectionEnd >= counter && selectionEnd < counter + lineLength) {
      end = counter + lineLength - 1;
    }
    counter += lineLength;
  }

  return { selectionEnd: end, selectionStart: start };
}

function newlinesToSurround(
  value: string,
  selectionStart: number,
  selectionEnd: number
): { newlinesToAppend: string; newlinesToPrepend: string } {
  const beforeSelection = value.slice(0, selectionStart);
  const afterSelection = value.slice(selectionEnd);
  const newlinesBefore =
    beforeSelection.match(TRAILING_NEWLINES_RE)?.[0].length ?? 0;
  const newlinesAfter =
    afterSelection.match(LEADING_NEWLINES_RE)?.[0].length ?? 0;

  let newlinesToAppend = "";
  let newlinesToPrepend = "";

  if (NON_WHITESPACE_RE.test(beforeSelection) && newlinesBefore < 2) {
    newlinesToAppend = "\n".repeat(2 - newlinesBefore);
  }
  if (NON_WHITESPACE_RE.test(afterSelection) && newlinesAfter < 2) {
    newlinesToPrepend = "\n".repeat(2 - newlinesAfter);
  }

  return { newlinesToAppend, newlinesToPrepend };
}

function expandSelectedText(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefixToUse: string,
  suffixToUse: string,
  multiline = false
): { selectionStart: number; selectionEnd: number; selectedText: string } {
  let start = selectionStart;
  let end = selectionEnd;

  if (start === end) {
    start = wordSelectionStart(value, start);
    end = wordSelectionEnd(value, end, multiline);
  } else {
    const expandedStart = start - prefixToUse.length;
    const expandedEnd = end + suffixToUse.length;
    const beginsWithPrefix = value.slice(expandedStart, start) === prefixToUse;
    const endsWithSuffix = value.slice(end, expandedEnd) === suffixToUse;
    if (beginsWithPrefix && endsWithSuffix) {
      start = expandedStart;
      end = expandedEnd;
    }
  }

  return {
    selectedText: value.slice(start, end),
    selectionEnd: end,
    selectionStart: start,
  };
}

function replaceRange(
  value: string,
  start: number,
  end: number,
  text: string,
  selectionStart: number,
  selectionEnd: number
): EditResult {
  return {
    next: `${value.slice(0, start)}${text}${value.slice(end)}`,
    selectionEnd,
    selectionStart,
  };
}

function undoOrderedListStyle(text: string): {
  text: string;
  processed: boolean;
} {
  const lines = text.split("\n");
  const shouldUndo = lines.every((line) => ORDERED_LIST_RE.test(line));
  return {
    processed: shouldUndo,
    text: shouldUndo
      ? lines.map((line) => line.replace(ORDERED_LIST_RE, "")).join("\n")
      : text,
  };
}

function undoUnorderedListStyle(text: string): {
  text: string;
  processed: boolean;
} {
  const lines = text.split("\n");
  const shouldUndo = lines.every((line) =>
    line.startsWith(UNORDERED_LIST_PREFIX)
  );
  return {
    processed: shouldUndo,
    text: shouldUndo
      ? lines.map((line) => line.slice(UNORDERED_LIST_PREFIX.length)).join("\n")
      : text,
  };
}

function makePrefix(index: number, unorderedList: boolean): string {
  return unorderedList ? "- " : `${index + 1}. `;
}

function clearExistingListStyle(
  orderedList: boolean,
  selectedText: string
): {
  undoResult: { text: string; processed: boolean };
  undoOpposite: { text: string; processed: boolean };
  pristineText: string;
} {
  if (orderedList) {
    const undoResult = undoOrderedListStyle(selectedText);
    const undoOpposite = undoUnorderedListStyle(undoResult.text);
    return {
      pristineText: undoOpposite.text,
      undoOpposite,
      undoResult,
    };
  }

  const undoResult = undoUnorderedListStyle(selectedText);
  const undoOpposite = undoOrderedListStyle(undoResult.text);
  return {
    pristineText: undoOpposite.text,
    undoOpposite,
    undoResult,
  };
}

function listStyle(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  style: StyleArgs
): EditResult {
  const noInitialSelection = selectionStart === selectionEnd;
  const unorderedList = Boolean(style.unorderedList);
  const orderedList = Boolean(style.orderedList);

  const lineSelection = expandSelectionToLine(
    value,
    selectionStart,
    selectionEnd
  );
  const start = lineSelection.selectionStart;
  const end = lineSelection.selectionEnd;
  const selectedText = value.slice(start, end);

  const { undoResult, undoOpposite, pristineText } = clearExistingListStyle(
    orderedList,
    selectedText
  );

  const prefixedLines = pristineText
    .split("\n")
    .map((line, index) => `${makePrefix(index, unorderedList)}${line}`);

  const totalPrefixLength = prefixedLines.reduce(
    (sum, _, index) => sum + makePrefix(index, unorderedList).length,
    0
  );

  const totalOppositePrefixLength = prefixedLines.reduce(
    (sum, _, index) => sum + makePrefix(index, !unorderedList).length,
    0
  );

  if (undoResult.processed) {
    if (noInitialSelection) {
      const cursor = Math.max(
        selectionStart - makePrefix(0, unorderedList).length,
        0
      );
      return replaceRange(value, start, end, pristineText, cursor, cursor);
    }
    return replaceRange(
      value,
      start,
      end,
      pristineText,
      start,
      end - totalPrefixLength
    );
  }

  const { newlinesToAppend, newlinesToPrepend } = newlinesToSurround(
    value,
    start,
    end
  );
  const text = `${newlinesToAppend}${prefixedLines.join("\n")}${newlinesToPrepend}`;

  if (noInitialSelection) {
    const cursor =
      selectionStart +
      makePrefix(0, unorderedList).length +
      newlinesToAppend.length;
    return replaceRange(value, start, end, text, cursor, cursor);
  }

  const nextStart = start + newlinesToAppend.length;
  const nextEnd = undoOpposite.processed
    ? end +
      newlinesToAppend.length +
      totalPrefixLength -
      totalOppositePrefixLength
    : end + newlinesToAppend.length + totalPrefixLength;

  return replaceRange(value, start, end, text, nextStart, nextEnd);
}

function unwrapBlockStyle(
  value: string,
  rangeStart: number,
  rangeEnd: number,
  selectedText: string,
  prefixToUse: string,
  suffixToUse: string,
  originalSelectionStart: number,
  originalSelectionEnd: number
): EditResult {
  const replacementText = selectedText.slice(
    prefixToUse.length,
    selectedText.length - suffixToUse.length
  );
  if (originalSelectionStart === originalSelectionEnd) {
    const position = Math.min(
      Math.max(originalSelectionStart - prefixToUse.length, rangeStart),
      rangeStart + replacementText.length
    );
    return replaceRange(
      value,
      rangeStart,
      rangeEnd,
      replacementText,
      position,
      position
    );
  }
  return replaceRange(
    value,
    rangeStart,
    rangeEnd,
    replacementText,
    rangeStart,
    rangeStart + replacementText.length
  );
}

function wrapBlockStyle(
  value: string,
  rangeStart: number,
  rangeEnd: number,
  selectedText: string,
  prefixToUse: string,
  suffixToUse: string,
  originalSelectionStart: number,
  originalSelectionEnd: number,
  trimFirst: boolean
): EditResult {
  let replacementText = `${prefixToUse}${selectedText}${suffixToUse}`;
  let nextStart = originalSelectionStart + prefixToUse.length;
  let nextEnd = originalSelectionEnd + prefixToUse.length;
  const whitespaceEdges = selectedText.match(EDGE_WHITESPACE_RE);
  if (trimFirst && whitespaceEdges) {
    const leadingWhitespace = whitespaceEdges[0] ?? "";
    const trailingWhitespace = whitespaceEdges[1] ?? "";
    replacementText = `${leadingWhitespace}${prefixToUse}${selectedText.trim()}${suffixToUse}${trailingWhitespace}`;
    nextStart += leadingWhitespace.length;
    nextEnd -= trailingWhitespace.length;
  }
  return replaceRange(
    value,
    rangeStart,
    rangeEnd,
    replacementText,
    nextStart,
    nextEnd
  );
}

function linkBlockStyle(
  value: string,
  rangeStart: number,
  rangeEnd: number,
  selectedText: string,
  prefixToUse: string,
  suffixToUse: string,
  replaceNext: string,
  scanFor: string
): EditResult {
  if (scanFor.length > 0 && selectedText.match(scanFor)) {
    const replacedSuffix = suffixToUse.replace(replaceNext, selectedText);
    const replacementText = `${prefixToUse}${replacedSuffix}`;
    const cursor = rangeStart + prefixToUse.length;
    return replaceRange(
      value,
      rangeStart,
      rangeEnd,
      replacementText,
      cursor,
      cursor
    );
  }

  const replacementText = `${prefixToUse}${selectedText}${suffixToUse}`;
  const nextStart =
    rangeStart +
    prefixToUse.length +
    selectedText.length +
    suffixToUse.indexOf(replaceNext);
  return replaceRange(
    value,
    rangeStart,
    rangeEnd,
    replacementText,
    nextStart,
    nextStart + replaceNext.length
  );
}

function blockStyle(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  arg: StyleArgs
): EditResult {
  const prefix = arg.prefix ?? "";
  const suffix = arg.suffix ?? "";
  const blockPrefix = arg.blockPrefix ?? "";
  const blockSuffix = arg.blockSuffix ?? "";
  const replaceNext = arg.replaceNext ?? "";
  const scanFor = arg.scanFor ?? "";
  const originalSelectionStart = selectionStart;
  const originalSelectionEnd = selectionEnd;
  const initialSelected = value.slice(selectionStart, selectionEnd);

  let prefixToUse =
    isMultipleLines(initialSelected) && blockPrefix.length > 0
      ? `${blockPrefix}\n`
      : prefix;
  let suffixToUse =
    isMultipleLines(initialSelected) && blockSuffix.length > 0
      ? `\n${blockSuffix}`
      : suffix;

  const expanded = expandSelectedText(
    value,
    selectionStart,
    selectionEnd,
    prefixToUse,
    suffixToUse,
    arg.multiline
  );
  const {
    selectionStart: rangeStart,
    selectionEnd: rangeEnd,
    selectedText,
  } = expanded;

  if (arg.surroundWithNewlines) {
    const { newlinesToAppend, newlinesToPrepend } = newlinesToSurround(
      value,
      rangeStart,
      rangeEnd
    );
    prefixToUse = newlinesToAppend + prefix;
    suffixToUse += newlinesToPrepend;
  }

  if (
    selectedText.startsWith(prefixToUse) &&
    selectedText.endsWith(suffixToUse)
  ) {
    return unwrapBlockStyle(
      value,
      rangeStart,
      rangeEnd,
      selectedText,
      prefixToUse,
      suffixToUse,
      originalSelectionStart,
      originalSelectionEnd
    );
  }

  const hasReplaceNext =
    replaceNext.length > 0 &&
    suffixToUse.includes(replaceNext) &&
    selectedText.length > 0;

  if (!hasReplaceNext) {
    return wrapBlockStyle(
      value,
      rangeStart,
      rangeEnd,
      selectedText,
      prefixToUse,
      suffixToUse,
      originalSelectionStart,
      originalSelectionEnd,
      Boolean(arg.trimFirst)
    );
  }

  return linkBlockStyle(
    value,
    rangeStart,
    rangeEnd,
    selectedText,
    prefixToUse,
    suffixToUse,
    replaceNext,
    scanFor
  );
}

function multilineStyle(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  arg: StyleArgs
): EditResult {
  const prefix = arg.prefix ?? "";
  const suffix = arg.suffix ?? "";
  let text = value.slice(selectionStart, selectionEnd);
  let nextStart = selectionStart;
  let nextEnd = selectionEnd;
  const lines = text.split("\n");
  const undoStyle = lines.every(
    (line) => line.startsWith(prefix) && line.endsWith(suffix)
  );

  if (undoStyle) {
    text = lines
      .map((line) => line.slice(prefix.length, line.length - suffix.length))
      .join("\n");
    nextEnd = nextStart + text.length;
  } else {
    text = lines.map((line) => `${prefix}${line}${suffix}`).join("\n");
    if (arg.surroundWithNewlines) {
      const { newlinesToAppend, newlinesToPrepend } = newlinesToSurround(
        value,
        selectionStart,
        selectionEnd
      );
      nextStart += newlinesToAppend.length;
      nextEnd = nextStart + text.length;
      text = `${newlinesToAppend}${text}${newlinesToPrepend}`;
    }
  }

  return replaceRange(
    value,
    selectionStart,
    selectionEnd,
    text,
    nextStart,
    nextEnd
  );
}

function headingStyle(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix = "## "
): EditResult {
  const noInitialSelection = selectionStart === selectionEnd;
  const lineSelection = expandSelectionToLine(
    value,
    selectionStart,
    selectionEnd
  );
  const selectedText = value.slice(
    lineSelection.selectionStart,
    lineSelection.selectionEnd
  );
  const lines = selectedText.split("\n");
  const shouldUndo = lines.every((line) => HEADING_PREFIX_RE.test(line));

  const text = shouldUndo
    ? lines.map((line) => line.replace(HEADING_PREFIX_RE, "")).join("\n")
    : lines
        .map((line) => `${prefix}${line.replace(HEADING_PREFIX_RE, "")}`)
        .join("\n");

  if (noInitialSelection) {
    const delta = shouldUndo
      ? -(selectedText.match(HEADING_PREFIX_RE)?.[0].length ?? 0)
      : prefix.length -
        (selectedText.match(HEADING_PREFIX_RE)?.[0].length ?? 0);
    const cursor = Math.max(
      selectionStart + delta,
      lineSelection.selectionStart
    );
    return replaceRange(
      value,
      lineSelection.selectionStart,
      lineSelection.selectionEnd,
      text,
      cursor,
      cursor
    );
  }

  return replaceRange(
    value,
    lineSelection.selectionStart,
    lineSelection.selectionEnd,
    text,
    lineSelection.selectionStart,
    lineSelection.selectionStart + text.length
  );
}

function applyMarkdownStyle(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  style: StyleArgs
): EditResult {
  const selected = value.slice(selectionStart, selectionEnd);

  if (style.orderedList || style.unorderedList) {
    return listStyle(value, selectionStart, selectionEnd, style);
  }
  if (style.multiline && isMultipleLines(selected)) {
    return multilineStyle(value, selectionStart, selectionEnd, style);
  }
  return blockStyle(value, selectionStart, selectionEnd, style);
}

function continueListOnEnter(
  value: string,
  selectionStart: number,
  selectionEnd: number
): EditResult | null {
  if (selectionStart !== selectionEnd) {
    return null;
  }

  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const line = value.slice(lineStart, selectionStart);
  const match = line.match(LIST_ITEM_RE);
  if (!match) {
    return null;
  }

  const [, indent, marker, content] = match;
  if (content === "") {
    return replaceRange(
      value,
      lineStart,
      selectionStart,
      "",
      lineStart,
      lineStart
    );
  }

  const nextMarker = ORDERED_MARKER_RE.test(marker)
    ? `${Number(marker.slice(0, -1)) + 1}.`
    : marker;
  const insertion = `\n${indent}${nextMarker} `;
  return replaceRange(
    value,
    selectionStart,
    selectionEnd,
    insertion,
    selectionStart + insertion.length,
    selectionStart + insertion.length
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            onClick={onClick}
            size="icon-sm"
            type="button"
            variant="ghost"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function EditorToolbar({
  enabled,
  variables,
  onStyle,
  onHeading,
  onSnippet,
  buttonSnippet,
}: {
  enabled: Required<MarkdownEditorFeatures>;
  variables?: readonly MarkdownEditorVariable[];
  onStyle: (style: StyleArgs) => void;
  onHeading: () => void;
  onSnippet: (snippet: string, selectInside?: boolean) => void;
  buttonSnippet: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-3xl p-0.5 ring-1 ring-border">
      {enabled.bold ? (
        <ToolbarButton
          label="Bold"
          onClick={() =>
            onStyle({ prefix: "**", suffix: "**", trimFirst: true })
          }
        >
          <BoldIcon />
        </ToolbarButton>
      ) : null}
      {enabled.italic ? (
        <ToolbarButton
          label="Italic"
          onClick={() => onStyle({ prefix: "_", suffix: "_", trimFirst: true })}
        >
          <ItalicIcon />
        </ToolbarButton>
      ) : null}
      {enabled.heading ? (
        <ToolbarButton label="Heading" onClick={onHeading}>
          <Heading2Icon />
        </ToolbarButton>
      ) : null}
      {enabled.bulletList ? (
        <ToolbarButton
          label="Bullet list"
          onClick={() =>
            onStyle({
              multiline: true,
              prefix: "- ",
              unorderedList: true,
            })
          }
        >
          <ListIcon />
        </ToolbarButton>
      ) : null}
      {enabled.numberedList ? (
        <ToolbarButton
          label="Numbered list"
          onClick={() =>
            onStyle({
              multiline: true,
              orderedList: true,
              prefix: "1. ",
            })
          }
        >
          <ListOrderedIcon />
        </ToolbarButton>
      ) : null}
      {enabled.link ? (
        <ToolbarButton
          label="Link"
          onClick={() =>
            onStyle({
              prefix: "[",
              replaceNext: "url",
              scanFor: "https?://",
              suffix: "](url)",
            })
          }
        >
          <LinkIcon />
        </ToolbarButton>
      ) : null}
      {enabled.youtube ? (
        <ToolbarButton
          label="YouTube"
          onClick={() => onSnippet("\n[!youtube]()\n", true)}
        >
          <MonitorPlayIcon />
        </ToolbarButton>
      ) : null}
      {enabled.button ? (
        <ToolbarButton
          label="Button"
          onClick={() => onSnippet(`\n${buttonSnippet}\n`)}
        >
          <MousePointerClickIcon />
        </ToolbarButton>
      ) : null}
      {variables && variables.length > 0 ? (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <Button size="icon-sm" type="button" variant="ghost" />
                  }
                />
              }
            >
              <VariableIcon />
            </TooltipTrigger>
            <TooltipContent>Insert variable</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            {variables.map((variable) => (
              <DropdownMenuItem
                key={variable.key}
                onClick={() => onSnippet(`{{${variable.key}}}`)}
              >
                {variable.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

export function MarkdownEditor({
  value,
  onChange,
  className,
  placeholder,
  variables,
  features,
  buttonSnippet = CTA_BUTTON_SNIPPET,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  /** Shown in the variables menu only when non-empty. */
  variables?: readonly MarkdownEditorVariable[];
  /** All tools enabled by default; set a key to `false` to hide it. */
  features?: MarkdownEditorFeatures;
  /** Markdown inserted by the CTA button tool. */
  buttonSnippet?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = useId();
  const [tab, setTab] = useState("write");
  const enabled = { ...DEFAULT_FEATURES, ...features };
  const showVariables = (variables?.length ?? 0) > 0;
  const hasToolbar =
    enabled.bold ||
    enabled.italic ||
    enabled.heading ||
    enabled.bulletList ||
    enabled.numberedList ||
    enabled.link ||
    enabled.youtube ||
    enabled.button ||
    showVariables;

  const commitEdit = (result: EditResult) => {
    onChange(result.next);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const applyStyle = (style: StyleArgs) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value}${style.prefix ?? ""}${style.suffix ?? ""}`);
      return;
    }
    commitEdit(
      applyMarkdownStyle(
        textarea.value,
        textarea.selectionStart,
        textarea.selectionEnd,
        style
      )
    );
  };

  const applyHeading = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value}## `);
      return;
    }
    commitEdit(
      headingStyle(
        textarea.value,
        textarea.selectionStart,
        textarea.selectionEnd
      )
    );
  };

  const insertSnippet = (snippet: string, selectInside = false) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value}${snippet}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${textarea.value.slice(0, start)}${snippet}${textarea.value.slice(end)}`;
    if (selectInside) {
      const open = snippet.indexOf("(") + 1;
      const close = snippet.lastIndexOf(")");
      commitEdit({
        next,
        selectionEnd: start + close,
        selectionStart: start + open,
      });
      return;
    }
    const cursor = start + snippet.length;
    commitEdit({ next, selectionEnd: cursor, selectionStart: cursor });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const meta = event.metaKey || event.ctrlKey;

    if (meta && event.key.toLowerCase() === "b" && enabled.bold) {
      event.preventDefault();
      applyStyle({ prefix: "**", suffix: "**", trimFirst: true });
      return;
    }
    if (meta && event.key.toLowerCase() === "i" && enabled.italic) {
      event.preventDefault();
      applyStyle({ prefix: "_", suffix: "_", trimFirst: true });
      return;
    }
    if (meta && event.key.toLowerCase() === "k" && enabled.link) {
      event.preventDefault();
      applyStyle({
        prefix: "[",
        replaceNext: "url",
        scanFor: "https?://",
        suffix: "](url)",
      });
      return;
    }

    if (event.key !== "Enter" || event.shiftKey || event.altKey || meta) {
      return;
    }

    const textarea = event.currentTarget;
    const result = continueListOnEnter(
      textarea.value,
      textarea.selectionStart,
      textarea.selectionEnd
    );
    if (!result) {
      return;
    }
    event.preventDefault();
    commitEdit(result);
  };

  return (
    <div className={cn("flex min-h-0 flex-col gap-2", className)}>
      <Tabs value={tab}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList variant="outlined">
            <TabsTrigger onClick={() => setTab("write")} value="write">
              Write
            </TabsTrigger>
            <TabsTrigger onClick={() => setTab("preview")} value="preview">
              Preview
            </TabsTrigger>
          </TabsList>
          {tab === "write" && hasToolbar ? (
            <EditorToolbar
              buttonSnippet={buttonSnippet}
              enabled={enabled}
              onHeading={applyHeading}
              onSnippet={insertSnippet}
              onStyle={applyStyle}
              variables={variables}
            />
          ) : null}
        </div>
        <TabsContent className="mt-2" value="write">
          <Textarea
            className="min-h-72 font-mono text-sm"
            id={textareaId}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            ref={textareaRef}
            value={value}
          />
        </TabsContent>
        <TabsContent className="mt-2" value="preview">
          <div className="min-h-72 rounded-2xl border border-border bg-input/50 p-4">
            <MarkdownViewer>{value}</MarkdownViewer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { CTA_BUTTON_SNIPPET };
