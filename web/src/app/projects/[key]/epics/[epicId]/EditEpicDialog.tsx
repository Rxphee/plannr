"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { PencilIcon } from "lucide-react";
import { useState } from "react";

import { updateEpic } from "../actions";
import { EpicFields, type EpicFormValues } from "../EpicFields";

interface EditEpicDialogProps {
    epic: { id: string; name: string; description: string };
}

export function EditEpicDialog({ epic }: EditEpicDialogProps) {
    const [open, setOpen] = useState(false);

    const handleSubmit = async ({ name, description = "" }: EpicFormValues) => {
        const { error } = await updateEpic(epic.id, { name, description });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
                <PencilIcon />
                Edit
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <FinalForm<EpicFormValues>
                    onSubmit={handleSubmit}
                    initialValues={{ name: epic.name, description: epic.description }}
                    className="grid gap-4"
                >
                    {({ pristine, submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit epic</DialogTitle>
                            </DialogHeader>
                            <EpicFields />
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
