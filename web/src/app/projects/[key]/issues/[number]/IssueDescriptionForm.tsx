"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { RichTextField } from "@src/components/form/RichTextField";
import { Button } from "@src/components/ui/Button";
import { FORM_ERROR } from "final-form";

import { updateIssue } from "../actions";

interface IssueDescriptionFormProps {
    issue: { id: string; description: string };
}

export function IssueDescriptionForm({ issue }: IssueDescriptionFormProps) {
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
                    <RichTextField name="description" placeholder="Add a description. Checklists replace sub-tasks." />
                    <FormSubmitError />
                    {!pristine && (
                        <div className="flex gap-2">
                            <Button type="submit" disabled={submitting}>
                                Save
                            </Button>
                            <Button type="button" variant="ghost" disabled={submitting} onClick={() => form.reset()}>
                                Discard
                            </Button>
                        </div>
                    )}
                </>
            )}
        </FinalForm>
    );
}
