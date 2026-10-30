"use client";

import { Button } from "@src/components/ui/Button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@src/components/ui/Dialog";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@src/components/ui/InputGroup";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

const COPIED_FEEDBACK_MS = 2000;

interface CreatedApiTokenProps {
    token: string;
    onDone: () => void;
}

// The only moment the token can be seen, Plannr keeps nothing but its hash
export function CreatedApiToken({ token, onDone }: CreatedApiTokenProps) {
    const [isCopied, setIsCopied] = useState(false);

    const copyToken = async () => {
        await navigator.clipboard.writeText(token);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
    };

    return (
        <div className="grid gap-4">
            <DialogHeader>
                <DialogTitle>Copy your API token</DialogTitle>
                <DialogDescription>
                    You will not see it again. Send it as <code>Authorization: Bearer &lt;token&gt;</code> with every request.
                </DialogDescription>
            </DialogHeader>
            <InputGroup>
                <InputGroupInput
                    readOnly
                    value={token}
                    aria-label="API token"
                    className="font-mono text-sm"
                    onFocus={(event) => event.target.select()}
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton size="icon-xs" onClick={copyToken} aria-label={isCopied ? "Copied" : "Copy token"} title="Copy token">
                        {isCopied ? <CheckIcon /> : <CopyIcon />}
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
            <DialogFooter>
                <Button onClick={onDone}>Done</Button>
            </DialogFooter>
        </div>
    );
}
