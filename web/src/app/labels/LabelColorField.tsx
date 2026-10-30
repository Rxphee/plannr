"use client";

import { cn } from "@src/lib/utils";
import { Field } from "react-final-form";

import { labelColors } from "./labelColors";

// The colors of the fixed palette as round swatches, a group of radio buttons for react-final-form
export function LabelColorField({ name }: { name: string }) {
    return (
        <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm leading-none font-medium">Color</legend>
            <div className="flex flex-wrap gap-2">
                {labelColors.map((color) => (
                    <Field key={color.value} name={name} type="radio" value={color.value}>
                        {({ input }) => (
                            <label title={color.label} className="cursor-pointer">
                                <input {...input} className="peer sr-only" aria-label={color.label} />
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "ring-offset-background peer-checked:ring-foreground peer-focus-visible:ring-ring block size-7 rounded-full ring-offset-2 transition-shadow duration-75 peer-checked:ring-2 peer-focus-visible:ring-2 hover:opacity-80",
                                        color.swatchClassName,
                                    )}
                                />
                            </label>
                        )}
                    </Field>
                ))}
            </div>
        </fieldset>
    );
}
