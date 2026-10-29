"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import { Input } from "@src/components/ui/Input";
import { Label } from "@src/components/ui/Label";
import type { GQLUpdateProjectInput } from "@src/graphql.generated";
import { FORM_ERROR } from "final-form";
import { LockIcon } from "lucide-react";
import { useId } from "react";

import { ProjectIcon } from "../../ProjectIcon";
import { PROJECT_NAME_MAX_LENGTH } from "../../projectValidation";
import { updateProject } from "./actions";

interface EditProjectFormProps {
    project: { id: string; key: string; name: string; description: string };
}

export function EditProjectForm({ project }: EditProjectFormProps) {
    const keyId = useId();
    const handleSubmit = async (values: GQLUpdateProjectInput) => {
        const { error } = await updateProject(project.id, values);
        if (error) {
            return { [FORM_ERROR]: error };
        }
    };

    return (
        <FinalForm<GQLUpdateProjectInput>
            onSubmit={handleSubmit}
            initialValues={{ name: project.name, description: project.description }}
            className="grid gap-4"
        >
            {({ pristine, submitting }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor={keyId}>Key</Label>
                        <div className="relative">
                            <ProjectIcon projectKey={project.key} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2" />
                            <Input
                                id={keyId}
                                value={project.key}
                                readOnly
                                aria-describedby={`${keyId}-description`}
                                className="bg-muted/50 dark:bg-muted/50 pr-9 pl-9 font-mono font-medium tracking-wide"
                            />
                            <LockIcon
                                aria-hidden="true"
                                className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                            />
                        </div>
                        <p id={`${keyId}-description`} className="text-muted-foreground text-sm">
                            Fixed, because every issue ID starts with it, e.g. <span className="font-mono">{project.key}-42</span>.
                        </p>
                    </div>
                    <TextField name="name" label="Name" required maxLength={PROJECT_NAME_MAX_LENGTH} />
                    <TextField name="description" label="Description" multiline rows={4} />
                    <FormSubmitError />
                    <div>
                        <Button type="submit" disabled={pristine || submitting}>
                            Save
                        </Button>
                    </div>
                </>
            )}
        </FinalForm>
    );
}
