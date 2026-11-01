"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import type { GQLLabelColor } from "@src/graphql.generated";
import { FORM_ERROR } from "final-form";
import { useTranslations } from "next-intl";
import { type ReactElement, useState } from "react";

import { createLabel, updateLabel } from "./actions";
import { LabelBadge } from "./LabelBadge";
import { LabelColorField } from "./LabelColorField";
import { LABEL_NAME_MAX_LENGTH } from "./labelValidation";

interface LabelFormValues {
    name: string;
    color: GQLLabelColor;
}

interface LabelDialogProps {
    trigger: ReactElement;
    // Edits this label, without one the dialog creates a new label
    label?: { id: string; name: string; color: GQLLabelColor };
}

export function LabelDialog({ trigger, label }: LabelDialogProps) {
    const t = useTranslations("labels");
    const tCommon = useTranslations("common");
    const [open, setOpen] = useState(false);

    const handleSubmit = async (values: LabelFormValues) => {
        const { error } = label ? await updateLabel(label.id, values) : await createLabel(values);
        if (error) {
            return { [FORM_ERROR]: error };
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={trigger} />
            <DialogContent>
                <FinalForm<LabelFormValues>
                    onSubmit={handleSubmit}
                    initialValues={label ? { name: label.name, color: label.color } : { color: "gray" }}
                    className="grid gap-4"
                >
                    {({ values, pristine, submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>{label ? t("editLabel") : t("newLabel")}</DialogTitle>
                                <DialogDescription>{t("dialogDescription")}</DialogDescription>
                            </DialogHeader>
                            <TextField name="name" label={tCommon("name")} required maxLength={LABEL_NAME_MAX_LENGTH} />
                            <LabelColorField name="color" />
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">{t("preview")}</span>
                                <LabelBadge label={{ name: values.name?.trim() || t("previewPlaceholder"), color: values.color }} />
                            </div>
                            <FormSubmitError />
                            <DialogFooter>
                                <Button type="submit" disabled={(label && pristine) || submitting}>
                                    {label ? tCommon("save") : t("createLabel")}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </FinalForm>
            </DialogContent>
        </Dialog>
    );
}
