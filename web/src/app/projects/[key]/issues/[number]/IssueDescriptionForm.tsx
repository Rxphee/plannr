"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { RichTextField } from "@src/components/form/RichTextField";
import { Button } from "@src/components/ui/Button";
import { FORM_ERROR } from "final-form";
import { useTranslations } from "next-intl";

import { updateIssue } from "../actions";

interface IssueDescriptionFormProps {
    issue: { id: string; description: string };
}

export function IssueDescriptionForm({ issue }: IssueDescriptionFormProps) {
    const t = useTranslations("issue");
    const tCommon = useTranslations("common");

    const handleSubmit = async ({ description = "" }: { description?: string }) => {
        const { error } = await updateIssue(issue.id, { description });
        if (error) {
            return { [FORM_ERROR]: error };
        }
    };

    return (
        <FinalForm<{ description?: string }> onSubmit={handleSubmit} initialValues={{ description: issue.description }} className="grid gap-3">
            {({ form, pristine, submitting }) => (
                <>
                    <RichTextField name="description" placeholder={t("descriptionPlaceholder")} />
                    <FormSubmitError />
                    {!pristine && (
                        <div className="flex gap-2">
                            <Button type="submit" disabled={submitting}>
                                {tCommon("save")}
                            </Button>
                            <Button type="button" variant="ghost" disabled={submitting} onClick={() => form.reset()}>
                                {tCommon("discard")}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </FinalForm>
    );
}
