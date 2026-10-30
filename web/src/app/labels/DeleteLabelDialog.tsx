"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

import { deleteLabel } from "./actions";

export function DeleteLabelDialog({ label }: { label: { id: string; name: string } }) {
    const [open, setOpen] = useState(false);

    const handleSubmit = async () => {
        const { error } = await deleteLabel(label.id);
        if (error) {
            return { [FORM_ERROR]: error };
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="hover:text-destructive"
                        aria-label={`Delete ${label.name}`}
                        title="Delete label"
                    />
                }
            >
                <Trash2Icon />
            </DialogTrigger>
            <DialogContent>
                <FinalForm onSubmit={handleSubmit} className="grid gap-4">
                    {({ submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Delete {label.name}</DialogTitle>
                                <DialogDescription>This removes the label from all issues in all projects. It cannot be undone.</DialogDescription>
                            </DialogHeader>
                            <FormSubmitError />
                            <DialogFooter>
                                <Button type="submit" variant="destructive" disabled={submitting}>
                                    Delete label
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </FinalForm>
            </DialogContent>
        </Dialog>
    );
}
