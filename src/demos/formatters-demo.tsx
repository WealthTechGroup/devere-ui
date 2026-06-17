import { Card, CardContent } from "@/components/ui/card";
import { capitalize, formatNumber, getCurrencyDisplay } from "@/lib/formatters";

const examples = [
  {
    label: "capitalize",
    input: '"portfolio value"',
    output: capitalize("portfolio value"),
  },
  {
    label: "formatNumber (currency)",
    input: "1250000, USD",
    output: formatNumber(1_250_000, {
      style: "currency",
      currency: "USD",
    }),
  },
  {
    label: "formatNumber (compact)",
    input: "2500000",
    output: formatNumber(2_500_000),
  },
  {
    label: "formatNumber (standard)",
    input: "42500, below threshold",
    output: formatNumber(42_500, {
      notation: "compact",
      compactThreshold: 1e6,
    }),
  },
  {
    label: "getCurrencyDisplay",
    input: "USD, GBP, ZAR",
    output: ["USD", "GBP", "ZAR"]
      .map((currency) => getCurrencyDisplay(currency))
      .join(" · "),
  },
] as const;

function FormattersDemo() {
  return (
    <div className="grid w-full gap-3">
      {examples.map((example) => (
        <Card
          className="bg-muted/30 shadow-none ring-0"
          key={example.label}
          size="sm"
        >
          <CardContent className="flex flex-col gap-1 py-4">
            <span className="font-medium text-sm">{example.label}</span>
            <span className="text-muted-foreground text-xs">
              {example.input}
            </span>
            <code className="font-mono text-sm">{example.output}</code>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { FormattersDemo };
