"use client";

import { RichTextField } from "@src/components/form/RichTextField";
import { TextField } from "@src/components/form/TextField";

import { EPIC_NAME_MAX_LENGTH } from "./epicValidation";

export interface EpicFormValues {
    name: string;
    description?: string;
}

// The fields of a new and an edited epic
export function EpicFields() {
    return (
        <>
            <TextField name="name" label="Name" required maxLength={EPIC_NAME_MAX_LENGTH} />
            <RichTextField name="description" label="Description" placeholder="What belongs to this epic, and when is it done?" />
        </>
    );
}
