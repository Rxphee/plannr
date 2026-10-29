"use client";

import { DatePicker } from "@src/components/DatePicker";
import { Label } from "@src/components/ui/Label";
import { useId } from "react";
import { Field } from "react-final-form";

interface DateFieldProps {
    name: string;
    label: string;
    placeholder?: string;
}

// A date picker for react-final-form; the value is a day like 2026-10-29
export function DateField({ name, label, placeholder }: DateFieldProps) {
    const id = useId();

    return (
        <Field<string | null | undefined> name={name}>
            {({ input }) => (
                <div className="grid gap-2">
                    <Label htmlFor={id}>{label}</Label>
                    <DatePicker id={id} value={input.value || null} onChange={input.onChange} placeholder={placeholder} />
                </div>
            )}
        </Field>
    );
}
