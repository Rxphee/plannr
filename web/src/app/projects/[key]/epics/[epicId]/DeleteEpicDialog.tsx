"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { SelectField } from "@src/components/form/SelectField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { Trash2Icon } from "lucide-react";

import { deleteEpic } from "../actions";

// Stands for deleting the issues in the select of where they go
const DELETE_ISSUES = "delete";

interface DeleteEpicDialogProps {
    projectKey: string;
    epic: { id: string; name: string };
    // The other epics of the project, General first
    otherEpics: { id: string; name: string }[];
}

export function DeleteEpicDialog({ projectKey, epic, otherEpics }: DeleteEpicDialogProps) {
    // On success the action redirects to the epic list
    const handleSubmit = async ({ issueTarget }: { issueTarget: string }) => {
        const { error } = await deleteEpic(projectKey, { id: epic.id, moveIssuesToEpicId: issueTarget === DELETE_ISSUES ? null : issueTarget });
        if (error) {
            return { [FORM_ERROR]: error };
        }
    };

    const issueTargetOptions = [
        ...otherEpics.map((otherEpic) => ({ value: otherEpic.id, label: `Move them to ${otherEpic.name}` })),
        { value: DELETE_ISSUES, label: "Delete them with the epic" },
    ];

    return (
        <Dialog>
            <DialogTrigger render={<Button variant="destructive" size="icon" aria-label="Delete epic" title="Delete epic" />}>
                <Trash2Icon />
            </DialogTrigger>
            <DialogContent>
                <FinalForm<{ issueTarget: string }>
                    onSubmit={handleSubmit}
                    initialValues={{ issueTarget: otherEpics[0]?.id ?? DELETE_ISSUES }}
                    className="grid gap-4"
                >
                    {({ values, submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Delete {epic.name}</DialogTitle>
                                <DialogDescription>Deleting the epic cannot be undone. Choose what happens with its issues.</DialogDescription>
                            </DialogHeader>
                            <SelectField name="issueTarget" label="Issues of the epic" required options={issueTargetOptions} />
                            {values.issueTarget === DELETE_ISSUES && (
                                <p className="text-destructive text-sm">The issues of the epic are deleted for good, including the done ones.</p>
                            )}
                            <FormSubmitError />
                            <DialogFooter>
                                <Button type="submit" variant="destructive" disabled={submitting}>
                                    Delete epic
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </FinalForm>
            </DialogContent>
        </Dialog>
    );
}
