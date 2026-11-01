"use client";

import { Label } from "@src/components/ui/Label";
import { useId } from "react";
import { Field } from "react-final-form";

import { AssigneeSelect } from "./AssigneeSelect";
import type { Assignee } from "./fetchAssigneeOptions";

interface AssigneeFieldProps {
    name: string;
    label: string;
    assignees: Assignee[];
    projectName: string;
}

// The assignee select for react-final-form, the value is the ID of the assignee or null
export function AssigneeField({ name, label, assignees, projectName }: AssigneeFieldProps) {
    const id = useId();

    return (
        <Field<string | null> name={name}>
            {({ input }) => (
                <div className="grid gap-2">
                    <Label htmlFor={id}>{label}</Label>
                    <AssigneeSelect id={id} assignees={assignees} value={input.value || null} onChange={input.onChange} projectName={projectName} />
                </div>
            )}
        </Field>
    );
}
