"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@src/components/ui/Select";
import type { ReactNode } from "react";

export interface SelectOption<Value extends string = string> {
    value: Value;
    label: string;
    // Shown before the label, in the list and in the trigger, e.g. the colored dot of a status
    icon?: ReactNode;
}

interface OptionSelectProps<Value extends string> {
    options: SelectOption<Value>[];
    value: Value | undefined;
    onChange: (value: Value) => void;
    placeholder?: string;
    disabled?: boolean;
    size?: "sm" | "default";
    id?: string;
    className?: string;
    "aria-label"?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
}

// A select for a fixed list of options with optional icons
export function OptionSelect<Value extends string>({
    options,
    value,
    onChange,
    placeholder,
    disabled,
    size,
    id,
    className,
    ...ariaProps
}: OptionSelectProps<Value>) {
    return (
        <Select
            items={options}
            value={value ?? null}
            disabled={disabled}
            onValueChange={(newValue) => {
                if (newValue && newValue !== value) {
                    onChange(newValue);
                }
            }}
        >
            <SelectTrigger id={id} size={size} className={className ?? "w-full"} {...ariaProps}>
                <SelectValue placeholder={placeholder}>
                    {(selectedValue: Value | null) => {
                        const option = options.find((candidate) => candidate.value === selectedValue);
                        return option ? <OptionLabel option={option} /> : <span className="text-muted-foreground">{placeholder}</span>;
                    }}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        <OptionLabel option={option} />
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export function OptionLabel({ option }: { option: SelectOption }) {
    return (
        <span className="flex min-w-0 items-center gap-2">
            {option.icon && (
                <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
                    {option.icon}
                </span>
            )}
            <span className="truncate">{option.label}</span>
        </span>
    );
}
