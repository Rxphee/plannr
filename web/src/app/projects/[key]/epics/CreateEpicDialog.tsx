"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { createEpic } from "./actions";
import { EpicFields, type EpicFormValues } from "./EpicFields";

export function CreateEpicDialog({ projectId }: { projectId: string }) {
    const [open, setOpen] = useState(false);

    const handleSubmit = async ({ name, description = "" }: EpicFormValues) => {
        const { error } = await createEpic({ projectId, name, description });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                <PlusIcon />
                New epic
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <FinalForm<EpicFormValues> onSubmit={handleSubmit} className="grid gap-4">
                    {({ submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>New epic</DialogTitle>
                                <DialogDescription>
                                    An epic groups the issues of one part of the project, like the design or the launch.
                                </DialogDescription>
                            </DialogHeader>
                            <EpicFields />
                            <FormSubmitError />
                            <DialogFooter>
                                <Button type="submit" disabled={submitting}>
                                    Create epic
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </FinalForm>
            </DialogContent>
        </Dialog>
    );
}
