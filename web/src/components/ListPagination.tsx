import { PageSizeSelect } from "@src/components/PageSizeSelect";
import { Button } from "@src/components/ui/Button";
import { cn } from "@src/lib/utils";
import { PAGE_SIZES, pageCountOf, pageWithSize, type Pagination } from "@src/util/pagination";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface ListPaginationProps {
    pagination: Pagination;
    totalCount: number;
    // The URL of the list with another page or page size, keeping its filters
    href: (pagination: Pagination) => string;
    className?: string;
}

// Page size, the range shown and the buttons to the previous and next page, below a paginated list
export function ListPagination({ pagination, totalCount, href, className }: ListPaginationProps) {
    // Stays visible on a single page as long as another page size would split the list, so a larger size can be taken back
    if (totalCount <= Math.min(...PAGE_SIZES)) {
        return null;
    }

    const { page, pageSize } = pagination;
    const pageCount = pageCountOf(totalCount, pagination);
    const first = Math.min((page - 1) * pageSize + 1, totalCount);
    const last = Math.min(page * pageSize, totalCount);
    const pageLink = (targetPage: number, label: string, icon: ReactNode) =>
        targetPage >= 1 && targetPage <= pageCount ? (
            <Button
                variant="outline"
                size="icon-sm"
                aria-label={label}
                nativeButton={false}
                render={<Link href={href({ ...pagination, page: targetPage })} />}
            >
                {icon}
            </Button>
        ) : (
            <Button variant="outline" size="icon-sm" aria-label={label} disabled>
                {icon}
            </Button>
        );

    return (
        <nav aria-label="Pages" className={cn("text-muted-foreground flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm", className)}>
            <div className="flex items-center gap-2">
                <span>Per page</span>
                <PageSizeSelect
                    pageSize={pageSize}
                    hrefs={PAGE_SIZES.map((size) => ({ pageSize: size, href: href({ page: pageWithSize(pagination, size), pageSize: size }) }))}
                />
            </div>
            <div className="flex items-center gap-3">
                <span className="tabular-nums">
                    {first}–{last} of {totalCount}
                </span>
                <div className="flex gap-1">
                    {pageLink(page - 1, "Previous page", <ChevronLeftIcon />)}
                    {pageLink(page + 1, "Next page", <ChevronRightIcon />)}
                </div>
            </div>
        </nav>
    );
}
