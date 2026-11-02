"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface CreatedIssue {
    key: string;
    number: number;
    project: { key: string };
}

// A new issue may land outside the list on screen (another page, view or epic), so a toast names it and opens it
export function useIssueCreatedToast(): (issue: CreatedIssue) => void {
    const t = useTranslations("toasts");
    const router = useRouter();

    return (issue) => {
        const issuePath = `/projects/${issue.project.key}/issues/${issue.number}`;
        toast.success(t("issueCreated", { key: issue.key }), {
            action: { label: t("open"), onClick: () => router.push(issuePath) },
        });
    };
}
