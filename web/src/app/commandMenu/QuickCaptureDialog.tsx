"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { SelectField } from "@src/components/form/SelectField";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@src/components/ui/Dialog";
import type { GQLIssuePriority, GQLIssueType } from "@src/graphql.generated";
import { FORM_ERROR } from "final-form";
import { useTranslations } from "next-intl";

import { createIssue } from "../projects/[key]/issues/actions";
import { ISSUE_TITLE_MAX_LENGTH } from "../projects/[key]/issues/issueOptions";
import { useIssueSelectOptions } from "../projects/[key]/issues/issueSelectOptions";
import { useIssueCreatedToast } from "../projects/[key]/issues/useIssueCreatedToast";
import { ProjectIcon } from "../projects/ProjectIcon";
import { useCurrentProject } from "../sidebar/useCurrentProject";
import type { QuickCaptureProject } from "./AppCommands";

interface QuickCaptureDialogProps {
    // The projects the user may add issues to
    projects: QuickCaptureProject[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface QuickCaptureFormValues {
    projectId: string;
    title: string;
    type: GQLIssueType;
    priority: GQLIssuePriority;
}

// Captures an issue with only a title in the epic General, without leaving the page.
// In a project it lands there, elsewhere the user picks the project. A toast confirms it with the new key,
// as the dialog closes right away.
export function QuickCaptureDialog({ projects, open, onOpenChange }: QuickCaptureDialogProps) {
    const t = useTranslations("quickCapture");
    const tFields = useTranslations("issueFields");
    const { typeOptions, priorityOptions } = useIssueSelectOptions();
    const currentProject = useCurrentProject(projects);
    const showIssueCreated = useIssueCreatedToast();

    const handleSubmit = async ({ projectId, title, type, priority }: QuickCaptureFormValues) => {
        const { error, issue } = await createIssue({ projectId, title, type, priority, description: "" });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        onOpenChange(false);
        if (issue) {
            showIssueCreated(issue);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <FinalForm<QuickCaptureFormValues>
                    onSubmit={handleSubmit}
                    initialValues={{ projectId: currentProject?.id, type: "task", priority: "normal" }}
                    className="grid gap-4"
                >
                    {({ submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>{t("title")}</DialogTitle>
                                <DialogDescription>
                                    {currentProject ? t("descriptionInProject", { project: currentProject.name }) : t("description")}
                                </DialogDescription>
                            </DialogHeader>
                            <TextField name="title" label={tFields("title")} required maxLength={ISSUE_TITLE_MAX_LENGTH} />
                            {!currentProject && (
                                <SelectField
                                    name="projectId"
                                    label={t("project")}
                                    required
                                    placeholder={t("chooseProject")}
                                    options={projects.map((project) => ({
                                        value: project.id,
                                        label: project.name,
                                        icon: <ProjectIcon projectKey={project.key} />,
                                    }))}
                                />
                            )}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <SelectField name="type" label={tFields("type")} required options={typeOptions} />
                                <SelectField name="priority" label={tFields("priority")} required options={priorityOptions} />
                            </div>
                            <FormSubmitError />
                            <DialogFooter>
                                <Button type="submit" disabled={submitting}>
                                    {t("submit")}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </FinalForm>
            </DialogContent>
        </Dialog>
    );
}
