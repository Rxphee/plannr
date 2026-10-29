"use client";

import { Button } from "@src/components/ui/Button";
import type { GQLProjectStatus } from "@src/graphql.generated";
import { useState, useTransition } from "react";

import { changeProjectStatus } from "./actions";

const statusDescriptions: Record<GQLProjectStatus, string> = {
    active: "The project is active.",
    paused: "The project is paused. Resume it when the work goes on.",
    archived: "The project is archived. Restore it to work on it again, or delete it below.",
};

interface ProjectStatusActionsProps {
    project: { id: string; status: GQLProjectStatus };
}

export function ProjectStatusActions({ project }: ProjectStatusActionsProps) {
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
            <p className="text-sm">{statusDescriptions[project.status]}</p>
            <div className="flex gap-2">
                {project.status === "active" && (
                    <Button variant="outline" disabled={pending} onClick={() => changeStatus("paused")}>
                        Pause
                    </Button>
                )}
                {project.status === "paused" && (
                    <Button variant="outline" disabled={pending} onClick={() => changeStatus("active")}>
                        Resume
                    </Button>
                )}
                {project.status === "archived" ? (
                    <Button variant="outline" disabled={pending} onClick={() => changeStatus("active")}>
                        Restore
                    </Button>
                ) : (
                    <Button variant="outline" disabled={pending} onClick={() => changeStatus("archived")}>
                        Archive
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
