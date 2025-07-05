import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DateRangePicker({ className, onDateRangeChange }: { className?: string, onDateRangeChange: (dateRange: DateRange | undefined) => void }) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: addDays(new Date(2024, 6, 28), 3),
  });

  const [month, setMonth] = React.useState(new Date(2024, 6))

  const years = Array.from({ length: 10 }, (_, i) => 2020 + i)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    onDateRangeChange(selectedDate);
  };

  const handleMonthChange = (newMonth: string) => {
    const newDate = new Date(month);
    newDate.setMonth(parseInt(newMonth));
    setMonth(newDate);
  };

  const handleYearChange = (newYear: string) => {
    const newDate = new Date(month);
    newDate.setFullYear(parseInt(newYear));
    setMonth(newDate);
  };

  const handleClear = () => {
    setDate(undefined);
    onDateRangeChange(undefined);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex items-center justify-between p-2">
              <Select
                value={month.getMonth().toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue >{format(month, "MMMM")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={month.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue>{month.getFullYear()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="range"
              month={month}
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}