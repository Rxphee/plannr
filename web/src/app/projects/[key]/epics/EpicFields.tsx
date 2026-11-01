"use client";

import { RichTextField } from "@src/components/form/RichTextField";
import { TextField } from "@src/components/form/TextField";
import { useTranslations } from "next-intl";

import { EPIC_NAME_MAX_LENGTH } from "./epicValidation";

export interface EpicFormValues {
    name: string;
    description?: string;
}

// The fields of a new and an edited epic
export function EpicFields() {
    const t = useTranslations("epics");
    const tCommon = useTranslations("common");

    return (
        <>
            <TextField name="name" label={tCommon("name")} required maxLength={EPIC_NAME_MAX_LENGTH} />
            <RichTextField name="description" label={tCommon("description")} placeholder={t("descriptionPlaceholder")} />
        </>
    );
}
