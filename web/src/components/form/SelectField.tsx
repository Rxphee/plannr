"use client";

import { OptionSelect, type SelectOption } from "@src/components/OptionSelect";
import { Label } from "@src/components/ui/Label";
import { useId } from "react";
import { Field } from "react-final-form";

interface SelectFieldProps {
    name: string;
    label: string;
    options: SelectOption[];
    required?: boolean;
    placeholder?: string;
}

// A select for react-final-form, with label and error message
export function SelectField({ name, label, options, required, placeholder }: SelectFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;

    return (
        <Field<string | undefined> name={name} validate={(value) => (required && !value ? "Required" : undefined)}>
            {({ input, meta }) => {
                // The trigger loses focus as soon as the popup opens, so the field gets no onBlur and only a submit marks it as touched
                const error: string | undefined = meta.touched ? meta.error : undefined;

                return (
                    <div className="grid gap-2">
                        <Label htmlFor={id}>
                            {label}
                            {required && <span aria-hidden="true">*</span>}
                        </Label>
                        <OptionSelect
                            id={id}
                            options={options}
                            value={input.value || undefined}
                            onChange={input.onChange}
                            placeholder={placeholder}
                            aria-invalid={error ? true : undefined}
                            aria-describedby={error ? errorId : undefined}
                        />
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
