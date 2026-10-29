import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@src/components/ui/Breadcrumb";
import { Separator } from "@src/components/ui/Separator";
import { SidebarTrigger } from "@src/components/ui/Sidebar";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

interface PageHeaderProps {
    // The last breadcrumb is the current page and has no link
    breadcrumbs: { label: string; href?: string }[];
    actions?: ReactNode;
}

export function PageHeader({ breadcrumbs, actions }: PageHeaderProps) {
    return (
        <header className="bg-background/90 sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-3 backdrop-blur md:rounded-t-xl">
            <SidebarTrigger />
            <Separator orientation="vertical" className="my-3.5 mr-1" />
            <Breadcrumb className="min-w-0 flex-1">
                <BreadcrumbList className="flex-nowrap">
                    {breadcrumbs.map((breadcrumb, index) => (
                        <Fragment key={breadcrumb.href ?? breadcrumb.label}>
                            {index > 0 && <BreadcrumbSeparator />}
                            <BreadcrumbItem className="min-w-0">
                                {breadcrumb.href ? (
                                    <BreadcrumbLink render={<Link href={breadcrumb.href} />}>{breadcrumb.label}</BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage className="truncate">{breadcrumb.label}</BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
    );
}
