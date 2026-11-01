"use client";

import { FinalForm } from "@src/components/form/FinalForm";
import { FormSubmitError } from "@src/components/form/FormSubmitError";
import { TextField } from "@src/components/form/TextField";
import { Button } from "@src/components/ui/Button";
import type { GQLIssueLinkKind } from "@src/graphql.generated";
import { FORM_ERROR, type FormApi } from "final-form";
import { GitPullRequestIcon, LinkIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { addIssueLink, removeIssueLink } from "../actions";
import { linkLabel } from "./linkLabel";

const LINK_URL_PATTERN = /^(https?|obsidian):\/\/\S+$/;

interface IssueLinksProps {
    issue: { id: string; links: { id: string; url: string; kind: GQLIssueLinkKind }[] };
    canEdit: boolean;
}

export function IssueLinks({ issue, canEdit }: IssueLinksProps) {
    const t = useTranslations("issue");
    const [error, setError] = useState<string>();
    const [pending, startTransition] = useTransition();

    const remove = (id: string) => {
        startTransition(async () => {
            const result = await removeIssueLink(id);
            setError(result.error);
        });
    };

    return (
        <div className="grid grid-cols-1 gap-3">
            {issue.links.length > 0 ? (
                <ul className="grid grid-cols-1 gap-1">
                    {issue.links.map((link) => {
                        const Icon = link.kind === "pullRequest" ? GitPullRequestIcon : LinkIcon;

                        return (
                            <li key={link.id} className="group flex items-center gap-2 text-sm">
                                <Icon className="text-muted-foreground size-4 shrink-0" />
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={link.url}
                                    className="min-w-0 flex-1 truncate underline-offset-4 hover:underline"
                                >
                                    {linkLabel(link)}
                                </a>
                                {canEdit && (
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        disabled={pending}
                                        aria-label={t("removeLink", { url: link.url })}
                                        onClick={() => remove(link.id)}
                                    >
                                        <XIcon />
                                    </Button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-muted-foreground text-sm">{t("noLinks")}</p>
            )}
            {error && (
                <p className="text-destructive text-sm" aria-live="polite">
                    {error}
                </p>
            )}
            {canEdit && <AddIssueLinkForm issueId={issue.id} />}
        </div>
    );
}

function AddIssueLinkForm({ issueId }: { issueId: string }) {
    const t = useTranslations("issue");

    const handleSubmit = async ({ url = "" }: { url?: string }, form: FormApi<{ url?: string }>) => {
        const { error } = await addIssueLink({ issueId, url: url.trim() });
        if (error) {
            return { [FORM_ERROR]: error };
        }
        // Starts empty for the next link
        form.restart();
    };

    return (
        <FinalForm<{ url?: string }> onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
            {({ submitting, values }) => (
                <>
                    <TextField
                        name="url"
                        label={t("addLink")}
                        validate={(url) => (url?.trim() && !LINK_URL_PATTERN.test(url.trim()) ? t("linkUrlPattern") : undefined)}
                    />
                    <FormSubmitError />
                    <div>
                        <Button type="submit" variant="outline" size="sm" disabled={submitting || !values.url?.trim()}>
                            {t("add")}
                        </Button>
                    </div>
                </>
            )}
        </FinalForm>
    );
}
