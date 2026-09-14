import { useState } from "react";
import {
  type MonthRange,
  MonthRangeCalendar,
  MonthRangePicker,
} from "@/components/devere-ui/month-range-picker";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

const today = startOfMonth(new Date());

const initialRange: MonthRange = {
  end: today,
  start: addMonths(today, -5),
};

function MonthRangePickerDemo() {
  const [range, setRange] = useState<MonthRange>(initialRange);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-medium text-muted-foreground text-xs">
          Picker
        </span>
        <MonthRangePicker
          className="w-fit min-w-52"
          maxDate={today}
          onMonthRangeSelect={setRange}
          selectedMonthRange={range}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-medium text-muted-foreground text-xs">
          Calendar
        </span>
        <MonthRangeCalendar
          maxDate={today}
          onMonthRangeSelect={setRange}
          selectedMonthRange={range}
        />
      </div>
    </div>
  );
}

export { MonthRangePickerDemo };
