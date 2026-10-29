"use client";

import { DateField } from "@src/components/form/DateField";
import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { RichTextField } from "@src/components/form/RichTextField";
import { SelectField } from "@src/components/form/SelectField";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import type { GQLIssuePriority, GQLIssueType } from "@src/graphql.generated";
import { FORM_ERROR } from "final-form";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { createIssue } from "./actions";
import { ISSUE_TITLE_MAX_LENGTH } from "./issueOptions";
import { issuePrioritySelectOptions, issueTypeSelectOptions, toEpicSelectOptions } from "./issueSelectOptions";

interface CreateIssueDialogProps {
    project: { id: string; key: string; epics: { id: string; name: string }[] };
    // Preselected, e.g. the epic whose page is open
    epicId: string;
}

interface CreateIssueFormValues {
    title: string;
    type: GQLIssueType;
    priority: GQLIssuePriority;
    epicId: string;
    dueDate?: string | null;
    description?: string;
}

export function CreateIssueDialog({ project, epicId }: CreateIssueDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                <PlusIcon />
                New issue
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <CreateIssueForm project={project} epicId={epicId} onCreated={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}

function CreateIssueForm({ project, epicId, onCreated }: CreateIssueDialogProps & { onCreated: () => void }) {
    const handleSubmit = async ({ dueDate, description = "", ...values }: CreateIssueFormValues) => {
        const { error } = await createIssue({ ...values, projectId: project.id, dueDate: dueDate || null, description });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        onCreated();
    };

    return (
        <FinalForm<CreateIssueFormValues> onSubmit={handleSubmit} initialValues={{ type: "task", priority: "normal", epicId }} className="grid gap-4">
            {({ submitting }) => (
                <>
                    <DialogHeader>
                        <DialogTitle>New issue</DialogTitle>
                        <DialogDescription>
                            The issue gets the next number of {project.key}, e.g. {project.key}-42.
                        </DialogDescription>
                    </DialogHeader>
                    <TextField name="title" label="Title" required maxLength={ISSUE_TITLE_MAX_LENGTH} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <SelectField name="type" label="Type" required options={issueTypeSelectOptions} />
                        <SelectField name="priority" label="Priority" required options={issuePrioritySelectOptions} />
                        <SelectField name="epicId" label="Epic" required options={toEpicSelectOptions(project.epics)} />
                        <DateField name="dueDate" label="Due date" placeholder="No due date" />
                    </div>
                    <RichTextField name="description" label="Description" placeholder="What needs to be done? Checklists replace sub-tasks." />
                    <FormSubmitError />
                    <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                            Create issue
                        </Button>
                    </DialogFooter>
                </>
            )}
        </FinalForm>
    );
}
