"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { MultiSelectField } from "@src/components/form/MultiSelectField";
import { SelectField } from "@src/components/form/SelectField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import type { GQLInstanceRole, GQLProjectMemberRole } from "@src/graphql.generated";
import { FORM_ERROR } from "final-form";
import { UserPlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PROJECT_MEMBER_ROLES } from "../projectMemberRoles";
import { addProjectMembers } from "./actions";

interface AddProjectMembersDialogProps {
    projectId: string;
    // Users who are not a member yet
    users: { id: string; firstName: string; lastName: string; instanceRole: GQLInstanceRole }[];
}

export function AddProjectMembersDialog({ projectId, users }: AddProjectMembersDialogProps) {
    const t = useTranslations("addProjectMembers");
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" className="w-fit" disabled={users.length === 0} />}>
                <UserPlusIcon />
                {t("trigger")}
            </DialogTrigger>
            <DialogContent>
                <AddProjectMembersForm projectId={projectId} users={users} onAdded={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}

interface AddProjectMembersFormValues {
    userIds: string[];
    role: GQLProjectMemberRole;
}

function AddProjectMembersForm({ projectId, users, onAdded }: AddProjectMembersDialogProps & { onAdded: () => void }) {
    const t = useTranslations("addProjectMembers");
    const tRole = useTranslations("projectMemberRole");
    const tInstanceRole = useTranslations("instanceRole");

    // Admins can be added, their role takes effect once their admin rights end
    const memberOptionLabel = ({ firstName, lastName, instanceRole }: AddProjectMembersDialogProps["users"][number]): string => {
        const name = `${firstName} ${lastName}`;
        return instanceRole === "user" ? name : `${name} (${tInstanceRole(instanceRole)})`;
    };

    const handleSubmit = async (values: AddProjectMembersFormValues) => {
        const { error } = await addProjectMembers({ projectId, ...values });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        onAdded();
    };

    return (
        <FinalForm<AddProjectMembersFormValues> onSubmit={handleSubmit} initialValues={{ userIds: [], role: "member" }} className="grid gap-4">
            {({ submitting, values }) => (
                <>
                    <DialogHeader>
                        <DialogTitle>{t("title")}</DialogTitle>
                        <DialogDescription>{t("description")}</DialogDescription>
                    </DialogHeader>
                    <MultiSelectField
                        name="userIds"
                        label={t("people")}
                        required
                        placeholder={t("peoplePlaceholder")}
                        emptyText={t("noPeopleFound")}
                        options={users.map((user) => ({ value: user.id, label: memberOptionLabel(user) }))}
                    />
                    <SelectField
                        name="role"
                        label={t("role")}
                        required
                        options={PROJECT_MEMBER_ROLES.map((role) => ({ value: role, label: tRole(role) }))}
                    />
                    <FormSubmitError />
                    <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                            {t("submit", { count: values.userIds.length })}
                        </Button>
                    </DialogFooter>
                </>
            )}
        </FinalForm>
    );
}
