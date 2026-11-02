"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { createEpic } from "./actions";
import { EpicFields, type EpicFormValues } from "./EpicFields";

interface CreateEpicDialogProps {
    project: { id: string; key: string };
}

export function CreateEpicDialog({ project }: CreateEpicDialogProps) {
    const t = useTranslations("epics");
    const tToasts = useTranslations("toasts");
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const handleSubmit = async ({ name, description = "" }: EpicFormValues) => {
        const { error, epicId } = await createEpic({ projectId: project.id, name, description });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        setOpen(false);
        // The epics are sorted by name, so the new one may be on another page
        if (epicId) {
            const epicPath = `/projects/${project.key}/epics/${epicId}`;
            toast.success(tToasts("epicCreated", { name: name.trim() }), {
                action: { label: tToasts("open"), onClick: () => router.push(epicPath) },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                <PlusIcon />
                {t("newEpic")}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <FinalForm<EpicFormValues> onSubmit={handleSubmit} className="grid gap-4">
                    {({ submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>{t("newEpic")}</DialogTitle>
                                <DialogDescription>{t("newEpicDescription")}</DialogDescription>
                            </DialogHeader>
                            <EpicFields />
                            <FormSubmitError />
                            <DialogFooter>
                                <Button type="submit" disabled={submitting}>
                                    {t("createEpic")}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </FinalForm>
            </DialogContent>
        </Dialog>
    );
}
