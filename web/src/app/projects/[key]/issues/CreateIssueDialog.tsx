"use client";

import { toLabelSelectOptions } from "@src/app/labels/labelSelectOptions";
import { DateField } from "@src/components/form/DateField";
import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { MultiSelectField } from "@src/components/form/MultiSelectField";
import { RichTextField } from "@src/components/form/RichTextField";
import { SelectField } from "@src/components/form/SelectField";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import type { GQLIssuePriority, GQLIssueType, GQLLabelColor } from "@src/graphql.generated";
import { FORM_ERROR } from "final-form";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { createIssue } from "./actions";
import { AssigneeField } from "./AssigneeField";
import type { Assignee } from "./fetchAssigneeOptions";
import { ISSUE_TITLE_MAX_LENGTH } from "./issueOptions";
import { toEpicSelectOptions, useIssueSelectOptions } from "./issueSelectOptions";
import { useIssueCreatedToast } from "./useIssueCreatedToast";

interface CreateIssueDialogProps {
    project: { id: string; key: string; name: string; epics: { id: string; name: string }[] };
    // Preselected, e.g. the epic whose page is open
    epicId: string;
    // Without labels the label field is hidden
    labels: { id: string; name: string; color: GQLLabelColor }[];
    assignees: Assignee[];
}

interface CreateIssueFormValues {
    title: string;
    type: GQLIssueType;
    priority: GQLIssuePriority;
    epicId: string;
    assigneeId: string | null;
    dueDate?: string | null;
    labelIds?: string[];
    description?: string;
}

export function CreateIssueDialog({ project, epicId, labels, assignees }: CreateIssueDialogProps) {
    const t = useTranslations("createIssue");
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                <PlusIcon />
                {t("trigger")}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <CreateIssueForm project={project} epicId={epicId} labels={labels} assignees={assignees} onCreated={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}

function CreateIssueForm({ project, epicId, labels, assignees, onCreated }: CreateIssueDialogProps & { onCreated: () => void }) {
    const t = useTranslations("createIssue");
    const tFields = useTranslations("issueFields");
    const { typeOptions, priorityOptions } = useIssueSelectOptions();
    const showIssueCreated = useIssueCreatedToast();
    const handleSubmit = async ({ assigneeId, dueDate, labelIds = [], description = "", ...values }: CreateIssueFormValues) => {
        const { error, issue } = await createIssue({
            ...values,
            projectId: project.id,
            assigneeId,
            dueDate: dueDate || null,
            labelIds,
            description,
        });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        onCreated();
        if (issue) {
            showIssueCreated(issue);
        }
    };

    return (
        <FinalForm<CreateIssueFormValues>
            onSubmit={handleSubmit}
            initialValues={{ type: "task", priority: "normal", epicId, assigneeId: null }}
            className="grid gap-4"
        >
            {({ submitting }) => (
                <>
                    <DialogHeader>
                        <DialogTitle>{t("title")}</DialogTitle>
                        <DialogDescription>{t("description", { key: project.key })}</DialogDescription>
                    </DialogHeader>
                    <TextField name="title" label={tFields("title")} required maxLength={ISSUE_TITLE_MAX_LENGTH} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <SelectField name="type" label={tFields("type")} required options={typeOptions} />
                        <SelectField name="priority" label={tFields("priority")} required options={priorityOptions} />
                        <SelectField name="epicId" label={tFields("epic")} required options={toEpicSelectOptions(project.epics)} />
                        <AssigneeField name="assigneeId" label={tFields("assignee")} assignees={assignees} projectName={project.name} />
                        <DateField name="dueDate" label={tFields("dueDate")} placeholder={tFields("noDueDate")} />
                    </div>
                    {labels.length > 0 && (
                        <MultiSelectField
                            name="labelIds"
                            label={tFields("labels")}
                            options={toLabelSelectOptions(labels)}
                            placeholder={tFields("addLabels")}
                            emptyText={tFields("noMatchingLabel")}
                        />
                    )}
                    <RichTextField name="description" label={tFields("description")} placeholder={t("descriptionPlaceholder")} />
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
