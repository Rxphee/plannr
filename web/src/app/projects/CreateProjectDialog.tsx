"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import type { GQLCreateProjectInput } from "@src/graphql.generated";
import { FORM_ERROR } from "final-form";
import { PlusIcon } from "lucide-react";
import { useRef, useState } from "react";

import { createProject } from "./actions";
import { PROJECT_KEY_MAX_LENGTH, PROJECT_NAME_MAX_LENGTH, validateProjectKey } from "./projectValidation";
import { suggestProjectKey } from "./suggestProjectKey";

export function CreateProjectDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                <PlusIcon />
                New project
            </DialogTrigger>
            <DialogContent>
                {/* The popup unmounts when closed, so the form starts empty every time */}
                <CreateProjectForm onCreated={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}

function CreateProjectForm({ onCreated }: { onCreated: () => void }) {
    // The key follows the name until the user edits it
    const keyWasEdited = useRef(false);

    const handleSubmit = async (values: GQLCreateProjectInput) => {
        const { error } = await createProject(values);
        if (error) {
            return { [FORM_ERROR]: error };
        }
        onCreated();
    };

    return (
        <FinalForm<GQLCreateProjectInput> onSubmit={handleSubmit} className="grid gap-4">
            {({ form, values, submitting }) => (
                <>
                    <DialogHeader>
                        <DialogTitle>New project</DialogTitle>
                        <DialogDescription>
                            The key prefixes every issue ID, e.g. {values.key || "KEY"}-42. It cannot be changed later.
                        </DialogDescription>
                    </DialogHeader>
                    <TextField
                        name="name"
                        label="Name"
                        required
                        maxLength={PROJECT_NAME_MAX_LENGTH}
                        onValueChange={(name) => {
                            if (!keyWasEdited.current) {
                                form.change("key", suggestProjectKey(name));
                            }
                        }}
                    />
                    <TextField
                        name="key"
                        label="Key"
                        required
                        maxLength={PROJECT_KEY_MAX_LENGTH}
                        className="font-mono uppercase"
                        parse={(key) => key.toUpperCase()}
                        validate={validateProjectKey}
                        onValueChange={() => {
                            keyWasEdited.current = true;
                        }}
                    />
                    <TextField name="description" label="Description" multiline rows={4} />
                    <FormSubmitError />
                    <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                            Create project
                        </Button>
                    </DialogFooter>
                </>
            )}
        </FinalForm>
    );
}
