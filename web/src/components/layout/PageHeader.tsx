import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@src/components/ui/Breadcrumb";
import { Separator } from "@src/components/ui/Separator";
import { SidebarTrigger } from "@src/components/ui/Sidebar";
import { cn } from "@src/lib/utils";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

interface PageHeaderProps {
    // The last breadcrumb is the current page and has no link
    breadcrumbs: { label: string; href?: string }[];
    actions?: ReactNode;
}

export function PageHeader({ breadcrumbs, actions }: PageHeaderProps) {
    return (
        <header className="bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-3 md:rounded-t-xl">
            <SidebarTrigger />
            <Separator orientation="vertical" className="my-3.5 mr-1" />
            <Breadcrumb className="min-w-0 flex-1">
                <BreadcrumbList className="flex-nowrap">
                    {breadcrumbs.map((breadcrumb, index) => {
                        // Phones only have room for the current page and the one above it
                        const isHiddenOnPhones = index < breadcrumbs.length - 2;
                        const isFirstOnPhones = index === breadcrumbs.length - 2;

                        return (
                            <Fragment key={breadcrumb.href ?? breadcrumb.label}>
                                {index > 0 && (
                                    <BreadcrumbSeparator className={cn("shrink-0", (isHiddenOnPhones || isFirstOnPhones) && "hidden md:block")} />
                                )}
                                <BreadcrumbItem className={cn("min-w-0", isHiddenOnPhones && "hidden md:inline-flex")}>
                                    {breadcrumb.href ? (
                                        <BreadcrumbLink className="truncate" render={<Link href={breadcrumb.href} />}>
                                            {breadcrumb.label}
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage className="truncate">{breadcrumb.label}</BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                            </Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
    );
}
