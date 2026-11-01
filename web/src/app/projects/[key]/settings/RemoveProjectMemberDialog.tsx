"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { removeProjectMember } from "./actions";

interface RemoveProjectMemberDialogProps {
    project: { id: string; key: string; name: string };
    member: { assignedIssueCount: number; user: { id: string; firstName: string; lastName: string } };
}

// Asks first, since removing a member also unassigns their issues in the project
export function RemoveProjectMemberDialog({ project, member }: RemoveProjectMemberDialogProps) {
    const t = useTranslations("removeProjectMember");
    const tSettings = useTranslations("projectSettings");
    const [open, setOpen] = useState(false);
    const name = `${member.user.firstName} ${member.user.lastName}`;

    const handleSubmit = async () => {
        const { error } = await removeProjectMember(project.key, { projectId: project.id, userId: member.user.id });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={<Button variant="ghost" size="icon" aria-label={tSettings("remove", { name })} title={tSettings("remove", { name })} />}
            >
                <XIcon />
            </DialogTrigger>
            <DialogContent>
                <FinalForm onSubmit={handleSubmit} className="grid gap-4">
                    {({ submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>{t("title", { name, project: project.name })}</DialogTitle>
                                <DialogDescription>
                                    {member.assignedIssueCount > 0
                                        ? t("assignedIssues", { name, count: member.assignedIssueCount })
                                        : t("noAssignedIssues", { name })}
                                </DialogDescription>
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
