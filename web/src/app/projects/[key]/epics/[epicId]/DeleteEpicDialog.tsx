"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { SelectField } from "@src/components/form/SelectField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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
    const t = useTranslations("deleteEpic");
    const tToasts = useTranslations("toasts");
    const router = useRouter();

    const handleSubmit = async ({ issueTarget }: { issueTarget: string }) => {
        const { error } = await deleteEpic({ id: epic.id, moveIssuesToEpicId: issueTarget === DELETE_ISSUES ? null : issueTarget });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        toast.success(tToasts("epicDeleted", { name: epic.name }));
        router.push(`/projects/${projectKey}/epics`);
    };

    const issueTargetOptions = [
        ...otherEpics.map((otherEpic) => ({ value: otherEpic.id, label: t("moveTo", { epic: otherEpic.name }) })),
        { value: DELETE_ISSUES, label: t("deleteWithEpic") },
    ];

    return (
        <Dialog>
            <DialogTrigger render={<Button variant="destructive" size="icon" aria-label={t("trigger")} title={t("trigger")} />}>
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
                                <DialogTitle>{t("title", { epic: epic.name })}</DialogTitle>
                                <DialogDescription>{t("description")}</DialogDescription>
                            </DialogHeader>
                            <SelectField name="issueTarget" label={t("issueTarget")} required options={issueTargetOptions} />
                            {values.issueTarget === DELETE_ISSUES && <p className="text-destructive text-sm">{t("deleteWarning")}</p>}
                            <FormSubmitError />
                            <DialogFooter>
                                <Button type="submit" variant="destructive" disabled={submitting}>
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
