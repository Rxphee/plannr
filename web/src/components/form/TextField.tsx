"use client";

import { Input } from "@src/components/ui/Input";
import { Label } from "@src/components/ui/Label";
import { Textarea } from "@src/components/ui/Textarea";
import type { FieldValidator } from "final-form";
import { useId } from "react";
import { Field } from "react-final-form";

interface TextFieldProps {
    name: string;
    label: string;
    // Like required in Dextinity's fields: a value of only spaces counts as empty
    required?: boolean;
    validate?: FieldValidator<string | undefined>;
    parse?: (value: string) => string;
    onValueChange?: (value: string) => void;
    multiline?: boolean;
    rows?: number;
    type?: "text" | "date";
    maxLength?: number;
    className?: string;
}

// A text input or, with multiline, a textarea for react-final-form, with label and error message
export function TextField({ name, label, required, validate, parse, onValueChange, multiline, rows, type, maxLength, className }: TextFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;

    const validateField: FieldValidator<string | undefined> = (value, allValues, meta) => {
        if (required && !value?.trim()) {
            return "Required";
        }
        return validate?.(value, allValues, meta);
    };

    return (
        <Field<string | undefined> name={name} validate={validateField} parse={parse}>
            {({ input, meta }) => {
                const error: string | undefined = meta.touched
                    ? (meta.error ?? (meta.dirtySinceLastSubmit ? undefined : meta.submitError))
                    : undefined;
                const controlProps = {
                    ...input,
                    value: input.value ?? "",
                    id,
                    maxLength,
                    className,
                    "aria-invalid": error ? true : undefined,
                    "aria-describedby": error ? errorId : undefined,
                    onChange: (event: { target: { value: string } }) => {
                        input.onChange(event);
                        onValueChange?.(event.target.value);
                    },
                };

                return (
                    <div className="grid gap-2">
                        <Label htmlFor={id}>
                            {label}
                            {required && <span aria-hidden="true">*</span>}
                        </Label>
                        {multiline ? <Textarea {...controlProps} rows={rows} /> : <Input {...controlProps} type={type} />}
                        {error && (
                            <p id={errorId} className="text-destructive text-sm">
                                {error}
                            </p>
                        )}
                    </div>
                );
            }}
        </Field>
    );
}
