"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import type { GQLUpdateProjectInput } from "@src/graphql.generated";
import { FORM_ERROR } from "final-form";

import { PROJECT_NAME_MAX_LENGTH } from "../../projectValidation";
import { updateProject } from "./actions";

interface EditProjectFormProps {
    project: { id: string; key: string; name: string; description: string };
}

export function EditProjectForm({ project }: EditProjectFormProps) {
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
                    <div className="grid gap-1 text-sm">
                        <span className="font-medium">Key</span>
                        <span className="font-mono">{project.key}</span>
                        <span className="text-muted-foreground">Fixed, because every issue ID starts with it.</span>
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
