"use client";

import { OptionLabel, type SelectOption } from "@src/components/OptionSelect";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from "@src/components/ui/Combobox";
import { Label } from "@src/components/ui/Label";
import { useId } from "react";
import { Field } from "react-final-form";

interface MultiSelectFieldProps {
    name: string;
    label: string;
    options: SelectOption[];
    required?: boolean;
    placeholder?: string;
    // Shown when the search matches no option
    emptyText: string;
}

// Several values from a long list for react-final-form: the selected ones as chips, the others found by typing
export function MultiSelectField({ name, label, options, required, placeholder, emptyText }: MultiSelectFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const anchor = useComboboxAnchor();

    return (
        <Field<string[]> name={name} validate={(value) => (required && !value?.length ? "Required" : undefined)}>
            {({ input, meta }) => {
                const error: string | undefined = meta.touched ? meta.error : undefined;
                const selectedValues: string[] = input.value || [];

                return (
                    <div className="grid gap-2">
                        <Label htmlFor={id}>
                            {label}
                            {required && <span aria-hidden="true">*</span>}
                        </Label>
                        <Combobox
                            multiple
                            autoHighlight
                            items={options}
                            value={options.filter((option) => selectedValues.includes(option.value))}
                            onValueChange={(selected) => input.onChange(selected.map((option) => option.value))}
                            itemToStringLabel={(option) => option.label}
                            isItemEqualToValue={(option, value) => option.value === value.value}
                        >
                            <ComboboxChips ref={anchor} className="max-h-40 overflow-y-auto">
                                <ComboboxValue>
                                    {(selected: SelectOption[]) => (
                                        <>
                                            {selected.map((option) => (
                                                <ComboboxChip key={option.value}>
                                                    <OptionLabel option={option} />
                                                </ComboboxChip>
                                            ))}
                                            <ComboboxChipsInput
                                                id={id}
                                                placeholder={selected.length === 0 ? placeholder : undefined}
                                                onBlur={input.onBlur}
                                                onKeyDown={(event) => {
                                                    // With the popup closed, Base UI would clear all selected values; Escape only closes the dialog then
                                                    if (event.key === "Escape" && event.currentTarget.getAttribute("aria-expanded") !== "true") {
                                                        event.preventBaseUIHandler();
                                                    }
                                                }}
                                                aria-invalid={error ? true : undefined}
                                                aria-describedby={error ? errorId : undefined}
                                            />
                                        </>
                                    )}
                                </ComboboxValue>
                            </ComboboxChips>
                            <ComboboxContent anchor={anchor}>
                                <ComboboxEmpty>{emptyText}</ComboboxEmpty>
                                <ComboboxList>
                                    {(option: SelectOption) => (
                                        <ComboboxItem key={option.value} value={option}>
                                            <OptionLabel option={option} />
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
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
