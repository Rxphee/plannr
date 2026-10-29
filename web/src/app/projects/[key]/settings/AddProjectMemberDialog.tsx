"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { SelectField } from "@src/components/form/SelectField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import type { GQLProjectMemberRole } from "@src/graphql.generated";
import { FORM_ERROR } from "final-form";
import { UserPlusIcon } from "lucide-react";
import { useState } from "react";

import { projectMemberRoleOptions } from "../projectMemberRoles";
import { addProjectMember } from "./actions";

interface AddProjectMemberDialogProps {
    projectId: string;
    // Users who are not a member yet
    users: { id: string; firstName: string; lastName: string }[];
}

export function AddProjectMemberDialog({ projectId, users }: AddProjectMemberDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm" className="w-fit" disabled={users.length === 0} />}>
                <UserPlusIcon />
                Add member
            </DialogTrigger>
            <DialogContent>
                <AddProjectMemberForm projectId={projectId} users={users} onAdded={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}

interface AddProjectMemberFormValues {
    userId: string;
    role: GQLProjectMemberRole;
}

function AddProjectMemberForm({ projectId, users, onAdded }: AddProjectMemberDialogProps & { onAdded: () => void }) {
    const handleSubmit = async (values: AddProjectMemberFormValues) => {
        const { error } = await addProjectMember({ projectId, ...values });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        onAdded();
    };

    return (
        <FinalForm<AddProjectMemberFormValues> onSubmit={handleSubmit} initialValues={{ role: "member" }} className="grid gap-4">
            {({ submitting }) => (
                <>
                    <DialogHeader>
                        <DialogTitle>Add member</DialogTitle>
                        <DialogDescription>Only people who have logged in to Plannr at least once can be added.</DialogDescription>
                    </DialogHeader>
                    <SelectField
                        name="userId"
                        label="Person"
                        required
                        placeholder="Select a person"
                        options={users.map((user) => ({ value: user.id, label: `${user.firstName} ${user.lastName}` }))}
                    />
                    <SelectField name="role" label="Role" required options={projectMemberRoleOptions} />
                    <FormSubmitError />
                    <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                            Add member
                        </Button>
                    </DialogFooter>
                </>
            )}
        </FinalForm>
    );
}
