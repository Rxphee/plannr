"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { PencilIcon } from "lucide-react";
import { useState } from "react";

import { updateIssue } from "../actions";
import { ISSUE_TITLE_MAX_LENGTH } from "../issueOptions";

interface EditIssueTitleDialogProps {
    issue: { id: string; title: string };
}

export function EditIssueTitleDialog({ issue }: EditIssueTitleDialogProps) {
    const [open, setOpen] = useState(false);

    const handleSubmit = async ({ title }: { title: string }) => {
        const { error } = await updateIssue(issue.id, { title });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
                <PencilIcon />
                Edit title
            </DialogTrigger>
            <DialogContent>
                <FinalForm<{ title: string }> onSubmit={handleSubmit} initialValues={{ title: issue.title }} className="grid gap-4">
                    {({ pristine, submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit title</DialogTitle>
                            </DialogHeader>
                            <TextField name="title" label="Title" required maxLength={ISSUE_TITLE_MAX_LENGTH} />
                            <FormSubmitError />
                            <DialogFooter>
                                <Button type="submit" disabled={pristine || submitting}>
                                    Save
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </FinalForm>
            </DialogContent>
        </Dialog>
    );
}
