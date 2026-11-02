"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { deleteIssue } from "../actions";

interface DeleteIssueDialogProps {
    projectKey: string;
    issue: { id: string; key: string };
}

export function DeleteIssueDialog({ projectKey, issue }: DeleteIssueDialogProps) {
    const t = useTranslations("deleteIssue");
    const tToasts = useTranslations("toasts");
    const router = useRouter();
    const handleSubmit = async () => {
        const { error } = await deleteIssue(issue.id);
        if (error) {
            return { [FORM_ERROR]: error };
        }
        toast.success(tToasts("issueDeleted", { key: issue.key }));
        router.push(`/projects/${projectKey}/issues`);
    };

    return (
        <Dialog>
            <DialogTrigger render={<Button variant="destructive" size="icon" aria-label={t("trigger")} title={t("trigger")} />}>
                <Trash2Icon />
            </DialogTrigger>
            <DialogContent>
                <FinalForm onSubmit={handleSubmit} className="grid gap-4">
                    {({ submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>{t("title", { issue: issue.key })}</DialogTitle>
                                <DialogDescription>{t("description")}</DialogDescription>
                            </DialogHeader>
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
