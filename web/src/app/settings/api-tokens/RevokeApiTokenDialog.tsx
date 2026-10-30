"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

import { revokeApiToken } from "./actions";

export function RevokeApiTokenDialog({ apiToken }: { apiToken: { id: string; name: string } }) {
    const [open, setOpen] = useState(false);

    const handleSubmit = async () => {
        const { error } = await revokeApiToken(apiToken.id);
        if (error) {
            return { [FORM_ERROR]: error };
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="ghost" size="icon" aria-label={`Revoke ${apiToken.name}`} title="Revoke token" />}>
                <Trash2Icon />
            </DialogTrigger>
            <DialogContent>
                <FinalForm onSubmit={handleSubmit} className="grid gap-4">
                    {({ submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Revoke {apiToken.name}</DialogTitle>
                                <DialogDescription>
                                    Every tool that uses this token loses its access at once. This cannot be undone, but you can create a new token
                                    any time.
                                </DialogDescription>
                            </DialogHeader>
                            <FormSubmitError />
                            <DialogFooter>
                                <Button type="submit" variant="destructive" disabled={submitting}>
                                    Revoke token
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </FinalForm>
            </DialogContent>
        </Dialog>
    );
}
