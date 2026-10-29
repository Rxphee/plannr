"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { Trash2Icon } from "lucide-react";

import { deleteIssue } from "../actions";

interface DeleteIssueDialogProps {
    projectKey: string;
    issue: { id: string; key: string };
}

export function DeleteIssueDialog({ projectKey, issue }: DeleteIssueDialogProps) {
    // On success the action redirects to the issue list
    const handleSubmit = async () => {
        const { error } = await deleteIssue(projectKey, issue.id);
        if (error) {
            return { [FORM_ERROR]: error };
        }
    };

    return (
        <Dialog>
            <DialogTrigger render={<Button variant="destructive" size="icon" aria-label="Delete issue" title="Delete issue" />}>
                <Trash2Icon />
            </DialogTrigger>
            <DialogContent>
                <FinalForm onSubmit={handleSubmit} className="grid gap-4">
                    {({ submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Delete {issue.key}</DialogTitle>
                                <DialogDescription>
                                    This deletes the issue with its links. It cannot be undone. To keep it for the record, set its status to Canceled
                                    instead.
                                </DialogDescription>
                            </DialogHeader>
                            <FormSubmitError />
                            <DialogFooter>
                                <Button type="submit" variant="destructive" disabled={submitting}>
                                    Delete issue
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </FinalForm>
            </DialogContent>
        </Dialog>
    );
}
