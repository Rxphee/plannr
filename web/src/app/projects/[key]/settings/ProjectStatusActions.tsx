"use client";

import { Button } from "@src/components/ui/Button";
import type { GQLProjectStatus } from "@src/graphql.generated";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { changeProjectStatus } from "./actions";

const statusDescriptionKeys = { active: "statusActive", paused: "statusPaused", archived: "statusArchived" } as const;

interface ProjectStatusActionsProps {
    project: { id: string; status: GQLProjectStatus };
}

export function ProjectStatusActions({ project }: ProjectStatusActionsProps) {
    const t = useTranslations("projectSettings");
    const [error, setError] = useState<string>();
    const [pending, startTransition] = useTransition();

    const changeStatus = (status: GQLProjectStatus) => {
        startTransition(async () => {
            const result = await changeProjectStatus(project.id, status);
            setError(result.error);
        });
    };

    return (
        <div className="grid gap-3">
            <p className="text-sm">{t(statusDescriptionKeys[project.status])}</p>
            <div className="flex gap-2">
                {project.status === "active" && (
                    <Button variant="outline" disabled={pending} onClick={() => changeStatus("paused")}>
                        {t("pause")}
                    </Button>
                )}
                {project.status === "paused" && (
                    <Button variant="outline" disabled={pending} onClick={() => changeStatus("active")}>
                        {t("resume")}
                    </Button>
                )}
                {project.status === "archived" ? (
                    <Button variant="outline" disabled={pending} onClick={() => changeStatus("active")}>
                        {t("restore")}
                    </Button>
                ) : (
                    <Button variant="outline" disabled={pending} onClick={() => changeStatus("archived")}>
                        {t("archive")}
                    </Button>
                )}
            </div>
            {error && (
                <p className="text-destructive text-sm" aria-live="polite">
                    {error}
                </p>
            )}
        </div>
    );
}
