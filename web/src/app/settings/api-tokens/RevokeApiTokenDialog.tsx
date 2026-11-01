"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { Button } from "@src/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@src/components/ui/Dialog";
import { FORM_ERROR } from "final-form";
import { Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { revokeApiToken } from "./actions";

export function RevokeApiTokenDialog({ apiToken }: { apiToken: { id: string; name: string } }) {
    const t = useTranslations("apiTokens");
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
            <DialogTrigger
                render={<Button variant="ghost" size="icon" aria-label={t("revokeTrigger", { token: apiToken.name })} title={t("revokeSubmit")} />}
            >
                <Trash2Icon />
            </DialogTrigger>
            <DialogContent>
                <FinalForm onSubmit={handleSubmit} className="grid gap-4">
                    {({ submitting }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>{t("revokeTitle", { token: apiToken.name })}</DialogTitle>
                                <DialogDescription>{t("revokeDescription")}</DialogDescription>
                            </DialogHeader>
                            <FormSubmitError />
                            <DialogFooter>
                                <Button type="submit" variant="destructive" disabled={submitting}>
                                    {t("revokeSubmit")}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </FinalForm>
            </DialogContent>
        </Dialog>
    );
}
