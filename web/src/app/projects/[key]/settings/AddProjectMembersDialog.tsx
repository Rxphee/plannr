"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { MultiSelectField } from "@src/components/form/MultiSelectField";
import { SelectField } from "@src/components/form/SelectField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import type { GQLProjectMemberRole } from "@src/graphql.generated";
import { FORM_ERROR } from "final-form";
import { UserPlusIcon } from "lucide-react";
import { useState } from "react";

import { projectMemberRoleOptions } from "../projectMemberRoles";
import { addProjectMembers } from "./actions";

interface AddProjectMembersDialogProps {
    projectId: string;
    // Users who are not a member yet
    users: { id: string; firstName: string; lastName: string }[];
}

export function AddProjectMembersDialog({ projectId, users }: AddProjectMembersDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" className="w-fit" disabled={users.length === 0} />}>
                <UserPlusIcon />
                Add members
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
                        <DialogTitle>Add members</DialogTitle>
                        <DialogDescription>
                            Choose everyone who joins with the same role. Only people who have logged in to Plannr at least once can be added.
                        </DialogDescription>
                    </DialogHeader>
                    <MultiSelectField
                        name="userIds"
                        label="People"
                        required
                        placeholder="Search by name"
                        emptyText="No one found"
                        options={users.map((user) => ({ value: user.id, label: `${user.firstName} ${user.lastName}` }))}
                    />
                    <SelectField name="role" label="Role" required options={projectMemberRoleOptions} />
                    <FormSubmitError />
                    <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                            {values.userIds.length > 1 ? `Add ${values.userIds.length} members` : "Add member"}
                        </Button>
                    </DialogFooter>
                </>
            )}
        </FinalForm>
    );
}
