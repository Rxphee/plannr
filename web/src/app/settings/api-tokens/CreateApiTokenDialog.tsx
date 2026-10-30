"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { SelectField } from "@src/components/form/SelectField";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { type ReactElement, useState } from "react";

import { createApiToken } from "./actions";
import { type ApiTokenExpiry, apiTokenExpiryOptions, DEFAULT_API_TOKEN_EXPIRY, expiresAtOf } from "./apiTokenExpiry";
import { API_TOKEN_NAME_MAX_LENGTH } from "./apiTokenValidation";
import { CreatedApiToken } from "./CreatedApiToken";

interface ApiTokenFormValues {
    name: string;
    expiry: ApiTokenExpiry;
}

// The trigger differs by place, e.g. a button in the page header or in the empty list
export function CreateApiTokenDialog({ trigger }: { trigger: ReactElement }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={trigger} />
            <DialogContent>
                {/* The popup unmounts when closed, so the token is gone and the form starts empty the next time */}
                <CreateApiTokenContent onDone={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}

function CreateApiTokenContent({ onDone }: { onDone: () => void }) {
    const [token, setToken] = useState<string>();

    const handleSubmit = async ({ name, expiry }: ApiTokenFormValues) => {
        const { error, token: createdToken } = await createApiToken({ name, expiresAt: expiresAtOf(expiry) });
        if (!createdToken) {
            return { [FORM_ERROR]: error };
        }
        setToken(createdToken);
    };

    if (token) {
        return <CreatedApiToken token={token} onDone={onDone} />;
    }

    return (
        <FinalForm<ApiTokenFormValues> onSubmit={handleSubmit} initialValues={{ expiry: DEFAULT_API_TOKEN_EXPIRY }} className="grid gap-4">
            {({ submitting }) => (
                <>
                    <DialogHeader>
                        <DialogTitle>New API token</DialogTitle>
                        <DialogDescription>
                            The token acts as you, with all your rights in every project. Give it a name to recognize it later.
                        </DialogDescription>
                    </DialogHeader>
                    <TextField name="name" label="Name" required maxLength={API_TOKEN_NAME_MAX_LENGTH} />
                    <SelectField name="expiry" label="Expires after" options={apiTokenExpiryOptions} required />
                    <FormSubmitError />
                    <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                            Create token
                        </Button>
                    </DialogFooter>
                </>
            )}
        </FinalForm>
    );
}
