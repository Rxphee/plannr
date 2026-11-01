"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { RichTextField } from "@src/components/form/RichTextField";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import type { GQLCreateProjectInput } from "@src/graphql.generated";
import { FORM_ERROR } from "final-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactElement, useRef, useState } from "react";

import { createProject } from "./actions";
import { isValidProjectKey, PROJECT_KEY_MAX_LENGTH, PROJECT_NAME_MAX_LENGTH } from "./projectValidation";
import { suggestProjectKey } from "./suggestProjectKey";

// The trigger differs by place, e.g. a button in the page header or an icon in the sidebar
export function CreateProjectDialog({ trigger }: { trigger: ReactElement }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={trigger} />
            <DialogContent className="sm:max-w-2xl">
                {/* The popup unmounts when closed, so the form starts empty every time */}
                <CreateProjectForm onCreated={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}

function CreateProjectForm({ onCreated }: { onCreated: () => void }) {
    const t = useTranslations("createProject");
    const tCommon = useTranslations("common");
    const router = useRouter();
    // The key follows the name until the user edits it
    const keyWasEdited = useRef(false);

    const handleSubmit = async (values: GQLCreateProjectInput) => {
        const { error } = await createProject(values);
        if (error) {
            return { [FORM_ERROR]: error };
        }
        onCreated();
        router.push(`/projects/${values.key}`);
    };

    return (
        <FinalForm<GQLCreateProjectInput> onSubmit={handleSubmit} className="grid gap-4">
            {({ form, values, submitting }) => (
                <>
                    <DialogHeader>
                        <DialogTitle>{t("title")}</DialogTitle>
                        <DialogDescription>{t("description", { key: values.key || "KEY" })}</DialogDescription>
                    </DialogHeader>
                    <TextField
                        name="name"
                        label={tCommon("name")}
                        required
                        maxLength={PROJECT_NAME_MAX_LENGTH}
                        onValueChange={(name) => {
                            if (!keyWasEdited.current) {
                                form.change("key", suggestProjectKey(name));
                            }
                        }}
                    />
                    <TextField
                        name="key"
                        label={t("key")}
                        required
                        maxLength={PROJECT_KEY_MAX_LENGTH}
                        className="font-mono uppercase"
                        parse={(key) => key.toUpperCase()}
                        validate={(key) => (isValidProjectKey(key) ? undefined : t("keyPattern"))}
                        onValueChange={() => {
                            keyWasEdited.current = true;
                        }}
                    />
                    <RichTextField name="description" label={tCommon("description")} placeholder={t("descriptionPlaceholder")} />
                    <FormSubmitError />
                    <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                            {t("submit")}
                        </Button>
                    </DialogFooter>
                </>
            )}
        </FinalForm>
    );
}
