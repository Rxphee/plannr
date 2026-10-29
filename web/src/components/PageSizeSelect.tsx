"use client";

import { OptionSelect } from "@src/components/OptionSelect";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface PageSizeSelectProps {
    pageSize: number;
    // The URL of the list with each page size, computed on the server
    hrefs: { pageSize: number; href: string }[];
}

export function PageSizeSelect({ pageSize, hrefs }: PageSizeSelectProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const changePageSize = (value: string) => {
        const href = hrefs.find((option) => String(option.pageSize) === value)?.href;
        if (href) {
            startTransition(() => {
                router.replace(href, { scroll: false });
            });
        }
    };

    return (
        <OptionSelect
            options={hrefs.map((option) => ({ value: String(option.pageSize), label: String(option.pageSize) }))}
            value={String(pageSize)}
            onChange={changePageSize}
            disabled={pending}
            size="sm"
            className="w-18"
            aria-label="Entries per page"
        />
    );
}
