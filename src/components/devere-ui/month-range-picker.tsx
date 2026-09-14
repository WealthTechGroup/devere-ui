import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/devere-ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type MonthRange = {
  end: Date;
  start: Date;
};

type CalendarMonth = {
  name: string;
  number: number;
};

type QuickSelector = {
  endMonth: Date;
  label: string;
  startMonth: Date;
};

const MONTH_ROWS: CalendarMonth[][] = [
  [
    { name: "Jan", number: 0 },
    { name: "Feb", number: 1 },
    { name: "Mar", number: 2 },
    { name: "Apr", number: 3 },
  ],
  [
    { name: "May", number: 4 },
    { name: "Jun", number: 5 },
    { name: "Jul", number: 6 },
    { name: "Aug", number: 7 },
  ],
  [
    { name: "Sep", number: 8 },
    { name: "Oct", number: 9 },
    { name: "Nov", number: 10 },
    { name: "Dec", number: 11 },
  ],
];

const monthLabel = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
});

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function monthKey(year: number, month: number) {
  return year * 12 + month;
}

function isSameMonth(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  );
}

function isBeforeMonth(left: Date, right: Date) {
  return (
    monthKey(left.getFullYear(), left.getMonth()) <
    monthKey(right.getFullYear(), right.getMonth())
  );
}

function isInRange(date: Date, from: Date, to: Date) {
  return !(isBeforeMonth(date, from) || isBeforeMonth(to, date));
}

function rangeRoundClass(roundLeft: boolean, roundRight: boolean) {
  if (roundLeft && roundRight) {
    return "rounded-4xl";
  }
  if (roundLeft) {
    return "rounded-l-4xl rounded-r-none";
  }
  if (roundRight) {
    return "rounded-r-4xl rounded-l-none";
  }
  return "rounded-none";
}

function monthDate(year: number, month: CalendarMonth) {
  return new Date(year, month.number, 1);
}

function segmentRound(
  row: CalendarMonth[],
  index: number,
  year: number,
  rangeStart: Date,
  rangeEnd: Date
) {
  const date = monthDate(year, row[index]);
  const previous = index > 0 ? row[index - 1] : undefined;
  const next = index < row.length - 1 ? row[index + 1] : undefined;
  return {
    roundLeft:
      isSameMonth(date, rangeStart) ||
      !previous ||
      !isInRange(monthDate(year, previous), rangeStart, rangeEnd),
    roundRight:
      isSameMonth(date, rangeEnd) ||
      !next ||
      !isInRange(monthDate(year, next), rangeStart, rangeEnd),
  };
}

function clampMonth(date: Date, minDate?: Date, maxDate?: Date) {
  if (minDate && isBeforeMonth(date, minDate)) {
    return startOfMonth(minDate);
  }
  if (maxDate && isBeforeMonth(maxDate, date)) {
    return startOfMonth(maxDate);
  }
  return startOfMonth(date);
}

function formatRange(range?: MonthRange) {
  if (!range) {
    return null;
  }
  return `${monthLabel.format(range.start)} to ${monthLabel.format(range.end)}`;
}

function defaultQuickSelectors(): QuickSelector[] {
  const today = startOfMonth(new Date());
  const year = today.getFullYear();
  return [
    {
      endMonth: new Date(year, 11, 1),
      label: "This year",
      startMonth: new Date(year, 0, 1),
    },
    {
      endMonth: new Date(year - 1, 11, 1),
      label: "Last year",
      startMonth: new Date(year - 1, 0, 1),
    },
    {
      endMonth: today,
      label: "Last 6 months",
      startMonth: addMonths(today, -5),
    },
    {
      endMonth: today,
      label: "Last 12 months",
      startMonth: addMonths(today, -11),
    },
  ];
}

function MonthButton({
  className,
  disabled,
  inRange,
  label,
  onHover,
  onSelect,
  roundLeft,
  roundRight,
  selected,
}: {
  className?: string;
  disabled: boolean;
  inRange: boolean;
  label: string;
  onHover: () => void;
  onSelect: () => void;
  roundLeft: boolean;
  roundRight: boolean;
  selected: boolean;
}) {
  return (
    <td className={cn("p-0 text-center text-sm", className)}>
      <Button
        className={cn(
          "h-9 w-full font-normal",
          inRange && rangeRoundClass(roundLeft, roundRight),
          inRange && !selected && "bg-accent hover:bg-accent"
        )}
        disabled={disabled}
        onClick={onSelect}
        onMouseEnter={onHover}
        size="sm"
        variant={selected ? "default" : "ghost"}
      >
        {label}
      </Button>
    </td>
  );
}

function YearNavButton({
  className,
  direction,
  onClick,
}: {
  className?: string;
  direction: "next" | "previous";
  onClick: () => void;
}) {
  const previous = direction === "previous";
  return (
    <Button
      aria-label={previous ? "Previous year" : "Next year"}
      className={className}
      onClick={onClick}
      size="icon-xs"
      variant="outline"
    >
      {previous ? (
        <>
          <ChevronUpIcon className="sm:hidden" />
          <ChevronLeftIcon className="hidden sm:block" />
        </>
      ) : (
        <>
          <ChevronDownIcon className="sm:hidden" />
          <ChevronRightIcon className="hidden sm:block" />
        </>
      )}
    </Button>
  );
}

function YearSection({
  isDisabled,
  onHover,
  onSelect,
  rangeEnd,
  rangeStart,
  year,
}: {
  isDisabled: (date: Date) => boolean;
  onHover: (date: Date) => void;
  onSelect: (date: Date) => void;
  rangeEnd: Date;
  rangeStart: Date;
  year: number;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-2 text-center font-medium text-sm">{year}</p>
      <table className="w-full border-separate border-spacing-x-0 border-spacing-y-1">
        <tbody>
          {MONTH_ROWS.map((row) => (
            <tr key={row.map((month) => month.number).join("-")}>
              {row.map((month, index) => {
                const date = monthDate(year, month);
                const inRange = isInRange(date, rangeStart, rangeEnd);
                const { roundLeft, roundRight } = inRange
                  ? segmentRound(row, index, year, rangeStart, rangeEnd)
                  : { roundLeft: false, roundRight: false };
                return (
                  <MonthButton
                    disabled={isDisabled(date)}
                    inRange={inRange}
                    key={month.number}
                    label={month.name}
                    onHover={() => {
                      onHover(date);
                    }}
                    onSelect={() => {
                      onSelect(date);
                    }}
                    roundLeft={roundLeft}
                    roundRight={roundRight}
                    selected={
                      isSameMonth(date, rangeStart) ||
                      isSameMonth(date, rangeEnd)
                    }
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthRangeCalendar({
  maxDate,
  minDate,
  onMonthRangeSelect,
  onStartMonthSelect,
  quickSelectors = defaultQuickSelectors(),
  selectedMonthRange,
  showQuickSelectors = true,
}: {
  maxDate?: Date;
  minDate?: Date;
  onMonthRangeSelect?: (range: MonthRange) => void;
  onStartMonthSelect?: (date: Date) => void;
  quickSelectors?: QuickSelector[];
  selectedMonthRange?: MonthRange;
  showQuickSelectors?: boolean;
}) {
  const selectedStart = selectedMonthRange
    ? startOfMonth(selectedMonthRange.start)
    : startOfMonth(new Date());
  const selectedEnd = selectedMonthRange
    ? startOfMonth(selectedMonthRange.end)
    : selectedStart;
  const [start, setStart] = useState(selectedStart);
  const [end, setEnd] = useState(selectedEnd);
  const [pending, setPending] = useState(false);
  const [menuYear, setMenuYear] = useState(selectedStart.getFullYear());

  useEffect(() => {
    if (!selectedMonthRange || pending) {
      return;
    }
    setStart(startOfMonth(selectedMonthRange.start));
    setEnd(startOfMonth(selectedMonthRange.end));
    setMenuYear(selectedMonthRange.start.getFullYear());
  }, [pending, selectedMonthRange]);

  const applyRange = (nextStart: Date, nextEnd: Date) => {
    const from = clampMonth(nextStart, minDate, maxDate);
    const to = clampMonth(nextEnd, minDate, maxDate);
    const range = isBeforeMonth(to, from)
      ? { end: from, start: to }
      : { end: to, start: from };
    setStart(range.start);
    setEnd(range.end);
    setPending(false);
    setMenuYear(range.start.getFullYear());
    onMonthRangeSelect?.(range);
  };

  const selectMonth = (date: Date) => {
    if (!pending) {
      setPending(true);
      setStart(date);
      setEnd(date);
      onStartMonthSelect?.(date);
      return;
    }
    if (isBeforeMonth(date, start)) {
      setStart(date);
      setEnd(date);
      onStartMonthSelect?.(date);
      return;
    }
    applyRange(start, date);
  };

  const isDisabled = (date: Date) =>
    Boolean(
      (minDate && isBeforeMonth(date, minDate)) ||
        (maxDate && isBeforeMonth(maxDate, date))
    );

  const rangeStart = isBeforeMonth(end, start) ? end : start;
  const rangeEnd = isBeforeMonth(end, start) ? start : end;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex min-w-0 flex-col items-center gap-2 sm:relative sm:block sm:min-w-80">
        <YearNavButton
          className="sm:absolute sm:top-0 sm:left-0"
          direction="previous"
          onClick={() => {
            setMenuYear((year) => year - 1);
          }}
        />
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-4 sm:px-8">
          <YearSection
            isDisabled={isDisabled}
            onHover={(date) => {
              if (pending) {
                setEnd(date);
              }
            }}
            onSelect={selectMonth}
            rangeEnd={rangeEnd}
            rangeStart={rangeStart}
            year={menuYear}
          />
          <YearSection
            isDisabled={isDisabled}
            onHover={(date) => {
              if (pending) {
                setEnd(date);
              }
            }}
            onSelect={selectMonth}
            rangeEnd={rangeEnd}
            rangeStart={rangeStart}
            year={menuYear + 1}
          />
        </div>
        <YearNavButton
          className="sm:absolute sm:top-0 sm:right-0"
          direction="next"
          onClick={() => {
            setMenuYear((year) => year + 1);
          }}
        />
      </div>
      {showQuickSelectors ? (
        <div className="flex flex-col gap-2 sm:w-36">
          {quickSelectors.map((selector) => (
            <Button
              key={selector.label}
              onClick={() => {
                applyRange(selector.startMonth, selector.endMonth);
              }}
              size="sm"
              variant="outline"
            >
              {selector.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MonthRangePicker({
  className,
  maxDate,
  minDate,
  onMonthRangeSelect,
  placeholder = "Pick a month range",
  quickSelectors,
  selectedMonthRange,
  showQuickSelectors,
}: {
  className?: string;
  maxDate?: Date;
  minDate?: Date;
  onMonthRangeSelect?: (range: MonthRange) => void;
  placeholder?: string;
  quickSelectors?: QuickSelector[];
  selectedMonthRange?: MonthRange;
  showQuickSelectors?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const label = formatRange(selectedMonthRange);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            className={cn("min-w-50 justify-start font-normal", className)}
            size="sm"
            variant="outline"
          />
        }
      >
        <CalendarIcon />
        {label ?? placeholder}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto max-w-[calc(100vw-1.5rem)] p-3"
      >
        <MonthRangeCalendar
          maxDate={maxDate}
          minDate={minDate}
          onMonthRangeSelect={(range) => {
            onMonthRangeSelect?.(range);
            setOpen(false);
          }}
          quickSelectors={quickSelectors}
          selectedMonthRange={selectedMonthRange}
          showQuickSelectors={showQuickSelectors}
        />
      </PopoverContent>
    </Popover>
  );
}

export { MonthRangeCalendar, MonthRangePicker };
