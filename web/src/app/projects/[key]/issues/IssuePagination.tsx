import { Button } from "@src/components/ui/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { issueListHref, type IssueListParams, ISSUES_PAGE_SIZE } from "./issueListParams";

interface IssuePaginationProps {
    path: string;
    params: IssueListParams;
    totalCount: number;
}

export function IssuePagination({ path, params, totalCount }: IssuePaginationProps) {
    const pageCount = Math.ceil(totalCount / ISSUES_PAGE_SIZE);
    if (pageCount <= 1) {
        return null;
    }

    const first = (params.page - 1) * ISSUES_PAGE_SIZE + 1;
    const last = Math.min(params.page * ISSUES_PAGE_SIZE, totalCount);
    const pageLink = (page: number, label: string, icon: ReactNode) =>
        page >= 1 && page <= pageCount ? (
            <Button
                variant="outline"
                size="icon-sm"
                aria-label={label}
                nativeButton={false}
                render={<Link href={issueListHref(path, { ...params, page })} />}
            >
                {icon}
            </Button>
        ) : (
            <Button variant="outline" size="icon-sm" aria-label={label} disabled>
                {icon}
            </Button>
        );

    return (
        <nav aria-label="Pages" className="text-muted-foreground flex items-center justify-end gap-3 text-sm">
            <span className="tabular-nums">
                {first}–{last} of {totalCount}
            </span>
            <div className="flex gap-1">
                {pageLink(params.page - 1, "Previous page", <ChevronLeftIcon />)}
                {pageLink(params.page + 1, "Next page", <ChevronRightIcon />)}
            </div>
        </nav>
    );
}
