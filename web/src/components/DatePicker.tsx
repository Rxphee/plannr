"use client";

import { Button } from "@src/components/ui/Button";
import { Calendar } from "@src/components/ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@src/components/ui/Popover";
import { cn } from "@src/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

interface DatePickerProps {
    // A day like 2026-10-29, as the API stores dates without time
    value: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
    disabled?: boolean;
    size?: "sm" | "default";
    id?: string;
    className?: string;
    "aria-label"?: string;
}

// The day in the local time zone, so midnight never shifts it to the day before
function toDate(value: string): Date {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function toValue(date: Date): string {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part) => String(part).padStart(2, "0")).join("-");
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", disabled, size, id, className, ...ariaProps }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const selectedDate = value ? toDate(value) : undefined;

    const choose = (newValue: string | null) => {
        setOpen(false);
        if (newValue !== value) {
            onChange(newValue);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button
                        id={id}
                        variant="outline"
                        size={size}
                        disabled={disabled}
                        className={cn("justify-start gap-2 font-normal", !value && "text-muted-foreground", className ?? "w-full")}
                        {...ariaProps}
                    />
                }
            >
                <CalendarIcon className="text-muted-foreground" />
                {selectedDate ? dateFormat.format(selectedDate) : placeholder}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto gap-0 p-0">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    defaultMonth={selectedDate}
                    weekStartsOn={1}
                    onSelect={(date) => choose(date ? toValue(date) : null)}
                    autoFocus
                />
                <div className="flex justify-between gap-2 border-t p-2">
                    <Button variant="ghost" size="sm" onClick={() => choose(toValue(new Date()))}>
                        Today
                    </Button>
                    {value && (
                        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => choose(null)}>
                            Clear
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
