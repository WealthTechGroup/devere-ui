import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { cn } from "@/lib/utils";

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const BLOCK_DIRECTIVE_RE =
  /^(?:\[!button[^\]]*\]\([^)]+\)|\[!youtube\]\([^)]+\))\s*$/gm;

function extractYouTubeId(url: string): string | null {
  const match = url.match(YOUTUBE_REGEX);
  return match?.[1] ?? null;
}

/** Isolate button/youtube directives so they leave lists and sit on their own line. */
export function prepareMarkdown(source: string): string {
  return source
    .replace(BLOCK_DIRECTIVE_RE, "\n\n$&\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative my-4 w-full overflow-hidden rounded-2xl pt-[56.25%]">
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 size-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
      />
    </div>
  );
}

function buttonLabel(children: unknown): string | null {
  if (typeof children !== "string") {
    return null;
  }
  if (children === "!button") {
    return "Open link";
  }
  if (children.startsWith("!button ")) {
    return children.slice("!button ".length);
  }
  return null;
}

export const markdownComponents: Components = {
  a: ({ href, children }) => {
    const linkText = typeof children === "string" ? children : "";
    if (href && linkText === "!youtube") {
      const videoId = extractYouTubeId(href);
      if (videoId) {
        return <YouTubeEmbed videoId={videoId} />;
      }
    }
    const label = buttonLabel(children);
    if (href && label) {
      return (
        <a
          className="my-4 inline-flex items-center rounded-4xl bg-foreground px-4 py-2 font-semibold text-background text-sm no-underline"
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {label}
        </a>
      );
    }
    return (
      <a
        className="font-medium text-foreground underline underline-offset-2"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  },
  code: ({ children }) => (
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
      {children}
    </code>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => (
    <h1 className="mb-3 font-semibold text-2xl tracking-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 font-semibold text-xl tracking-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 font-semibold text-lg tracking-tight">{children}</h3>
  ),
  hr: () => <hr className="my-4 border-border" />,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  p: ({ children }) => (
    <p className="mb-3 leading-relaxed last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
};

export function MarkdownViewer({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  if (!children) {
    return null;
  }

  return (
    <div className={cn("text-foreground text-sm", className)}>
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[remarkBreaks]}
      >
        {prepareMarkdown(children)}
      </ReactMarkdown>
    </div>
  );
}
