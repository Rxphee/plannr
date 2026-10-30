"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { SelectField } from "@src/components/form/SelectField";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@src/components/ui/Dialog";
import type { GQLIssuePriority, GQLIssueType } from "@src/graphql.generated";
import { FORM_ERROR } from "final-form";

import { createIssue } from "../projects/[key]/issues/actions";
import { ISSUE_TITLE_MAX_LENGTH } from "../projects/[key]/issues/issueOptions";
import { issuePrioritySelectOptions, issueTypeSelectOptions } from "../projects/[key]/issues/issueSelectOptions";
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
// In a project it lands there, elsewhere the user picks the project.
export function QuickCaptureDialog({ projects, open, onOpenChange }: QuickCaptureDialogProps) {
    const currentProject = useCurrentProject(projects);

    const handleSubmit = async ({ projectId, title, type, priority }: QuickCaptureFormValues) => {
        const { error } = await createIssue({ projectId, title, type, priority, description: "" });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        onOpenChange(false);
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
                                <DialogTitle>Capture issue</DialogTitle>
                                <DialogDescription>
                                    {currentProject
                                        ? `Lands in the epic General of ${currentProject.name}, add the details later.`
                                        : "Lands in the epic General of the project, add the details later."}
                                </DialogDescription>
                            </DialogHeader>
                            <TextField name="title" label="Title" required maxLength={ISSUE_TITLE_MAX_LENGTH} />
                            {!currentProject && (
                                <SelectField
                                    name="projectId"
                                    label="Project"
                                    required
                                    placeholder="Choose a project"
                                    options={projects.map((project) => ({
                                        value: project.id,
                                        label: project.name,
                                        icon: <ProjectIcon projectKey={project.key} />,
                                    }))}
                                />
                            )}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <SelectField name="type" label="Type" required options={issueTypeSelectOptions} />
                                <SelectField name="priority" label="Priority" required options={issuePrioritySelectOptions} />
                            </div>
                            <FormSubmitError />
                            <DialogFooter>
                                <Button type="submit" disabled={submitting}>
                                    Create issue
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </FinalForm>
            </DialogContent>
        </Dialog>
    );
}
