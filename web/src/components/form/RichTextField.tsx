"use client";

import { RichTextEditor } from "@src/components/richText/RichTextEditor";
import { Label } from "@src/components/ui/Label";
import { useId } from "react";
import { Field } from "react-final-form";

interface RichTextFieldProps {
    name: string;
    // Without a label, e.g. when the card around the field already names it
    label?: string;
    placeholder?: string;
}

// A Markdown editor for react-final-form, with label and error message
export function RichTextField({ name, label, placeholder }: RichTextFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;

    return (
        <Field<string | undefined> name={name}>
            {({ input, meta }) => {
                const error: string | undefined = meta.dirtySinceLastSubmit ? undefined : meta.submitError;

                return (
                    <div className="grid gap-2">
                        {/* The editor is no form control a label could point to, so the label focuses it on click */}
                        {label && <Label onClick={() => document.getElementById(id)?.focus()}>{label}</Label>}
                        <RichTextEditor
                            id={id}
                            value={input.value ?? ""}
                            onChange={input.onChange}
                            placeholder={placeholder}
                            aria-label={label}
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
