"use client";

import { Button } from "@src/components/ui/Button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@src/components/ui/Dialog";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@src/components/ui/InputGroup";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const COPIED_FEEDBACK_MS = 2000;

interface CreatedApiTokenProps {
    token: string;
    onDone: () => void;
}

// The only moment the token can be seen, Plannr keeps nothing but its hash
export function CreatedApiToken({ token, onDone }: CreatedApiTokenProps) {
    const t = useTranslations("apiTokens");
    const [isCopied, setIsCopied] = useState(false);

    const copyToken = async () => {
        await navigator.clipboard.writeText(token);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
    };

    return (
        <div className="grid gap-4">
            <DialogHeader>
                <DialogTitle>{t("copyTitle")}</DialogTitle>
                <DialogDescription>
                    {t.rich("copyDescription", { header: "Authorization: Bearer <token>", code: (chunks) => <code>{chunks}</code> })}
                </DialogDescription>
            </DialogHeader>
            <InputGroup>
                <InputGroupInput
                    readOnly
                    value={token}
                    aria-label={t("token")}
                    className="font-mono text-sm"
                    onFocus={(event) => event.target.select()}
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton size="icon-xs" onClick={copyToken} aria-label={isCopied ? t("copied") : t("copy")} title={t("copy")}>
                        {isCopied ? <CheckIcon /> : <CopyIcon />}
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
            <DialogFooter>
                <Button onClick={onDone}>{t("done")}</Button>
            </DialogFooter>
        </div>
    );
}
