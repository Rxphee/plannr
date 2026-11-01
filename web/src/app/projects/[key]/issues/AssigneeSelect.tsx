"use client";

import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@src/components/ui/Dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@src/components/ui/Select";
import { UserAvatar } from "@src/components/UserAvatar";
import { CircleDashedIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { Assignee } from "./fetchAssigneeOptions";

// The select needs a value for every option, so this one stands for no assignee
const UNASSIGNED = "unassigned";

interface AssigneeSelectProps {
    assignees: Assignee[];
    // The ID of the assignee, null for none
    value: string | null;
    onChange: (assigneeId: string | null) => void;
    projectName: string;
    disabled?: boolean;
    size?: "sm" | "default";
    id?: string;
    "aria-label"?: string;
}

// The members of the project, then the admins without membership apart from them.
// Choosing such an admin asks first, since it makes them a member of the project.
export function AssigneeSelect({ assignees, value, onChange, projectName, disabled, size, id, "aria-label": ariaLabel }: AssigneeSelectProps) {
    const t = useTranslations("assigneeSelect");
    const [adminToConfirm, setAdminToConfirm] = useState<Assignee>();
    const members = assignees.filter(({ isMember }) => isMember);
    const admins = assignees.filter(({ isMember }) => !isMember);
    const selected = assignees.find((assignee) => assignee.id === value);

    const handleValueChange = (newValue: string | null) => {
        const assignee = assignees.find((candidate) => candidate.id === newValue);
        if (assignee && !assignee.isMember) {
            setAdminToConfirm(assignee);
            return;
        }
        const assigneeId = !newValue || newValue === UNASSIGNED ? null : newValue;
        if (assigneeId !== value) {
            onChange(assigneeId);
        }
    };

    return (
        <>
            <Select value={value ?? UNASSIGNED} disabled={disabled} onValueChange={handleValueChange}>
                <SelectTrigger id={id} size={size} className="w-full" aria-label={ariaLabel}>
                    <SelectValue>{() => (selected ? <Person assignee={selected} /> : <Unassigned />)}</SelectValue>
                </SelectTrigger>
                <SelectContent className="w-max max-w-(--available-width) min-w-(--anchor-width)">
                    <SelectItem value={UNASSIGNED}>
                        <Unassigned />
                    </SelectItem>
                    {members.length > 0 && (
                        <SelectGroup className="p-0">
                            <SelectLabel>{t("members")}</SelectLabel>
                            {members.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                    <Person assignee={member} />
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    )}
                    {admins.length > 0 && (
                        <>
                            <SelectSeparator />
                            <SelectGroup className="p-0">
                                <SelectLabel>{t("adminsWithoutMembership")}</SelectLabel>
                                {admins.map((admin) => (
                                    <SelectItem key={admin.id} value={admin.id}>
                                        <Person assignee={admin} />
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </>
                    )}
                </SelectContent>
            </Select>
            <Dialog open={adminToConfirm !== undefined} onOpenChange={(open) => !open && setAdminToConfirm(undefined)}>
                {adminToConfirm && (
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("confirmTitle", { name: `${adminToConfirm.firstName} ${adminToConfirm.lastName}` })}</DialogTitle>
                            <DialogDescription>
                                {t("confirmDescription", { name: `${adminToConfirm.firstName} ${adminToConfirm.lastName}`, project: projectName })}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    onChange(adminToConfirm.id);
                                    setAdminToConfirm(undefined);
                                }}
                            >
                                {t("confirm")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </>
    );
}

function Person({ assignee }: { assignee: Assignee }) {
    return (
        <span className="flex min-w-0 items-center gap-2">
            <UserAvatar user={assignee} size="xs" />
            <span className="truncate">
                {assignee.firstName} {assignee.lastName}
            </span>
        </span>
    );
}

function Unassigned() {
    const t = useTranslations("assigneeSelect");

    return (
        <span className="text-muted-foreground flex items-center gap-2">
            <CircleDashedIcon className="size-5" />
            {t("unassigned")}
        </span>
    );
}
