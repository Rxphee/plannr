"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { Trash2Icon } from "lucide-react";

import { deleteProject } from "./actions";

interface DeleteProjectDialogProps {
    project: { id: string; name: string };
}

export function DeleteProjectDialog({ project }: DeleteProjectDialogProps) {
    return (
        <div>
            <Dialog>
                <DialogTrigger render={<Button variant="destructive" />}>
                    <Trash2Icon />
                    Delete project
                </DialogTrigger>
                <DialogContent>
                    <DeleteProjectForm project={project} />
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DeleteProjectForm({ project }: DeleteProjectDialogProps) {
    // On success the action redirects to the project list
    const handleSubmit = async () => {
        const { error } = await deleteProject(project.id);
        if (error) {
            return { [FORM_ERROR]: error };
        }
    };

    return (
        <FinalForm<{ confirmation?: string }> onSubmit={handleSubmit} className="grid gap-4">
            {({ values, submitting }) => (
                <>
                    <DialogHeader>
                        <DialogTitle>Delete project</DialogTitle>
                        <DialogDescription>This deletes {project.name} with everything in it. It cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <TextField name="confirmation" label={`Type “${project.name}” to confirm`} />
                    <FormSubmitError />
                    <DialogFooter>
                        <Button type="submit" variant="destructive" disabled={values.confirmation !== project.name || submitting}>
                            Delete project
                        </Button>
                    </DialogFooter>
                </>
            )}
        </FinalForm>
    );
}
