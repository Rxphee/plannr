import { Skeleton } from "@src/components/ui/Skeleton";

import { PageContent } from "./PageContent";
import { PageHeader } from "./PageHeader";

interface PageSkeletonProps {
    // The shape of the content: rows of a list, a grid of cards, or a detail page with a side column
    variant: "list" | "cards" | "detail";
}

// Shown at once while a page loads on the server, so every click answers right away
export function PageSkeleton({ variant }: PageSkeletonProps) {
    return (
        <div aria-busy="true" aria-label="Loading">
            <PageHeader breadcrumbs={[]} />
            <div className="border-b">
                <div className="mx-auto grid w-full max-w-6xl gap-3 px-4 pt-8 pb-6 md:px-8">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96 max-w-full" />
                </div>
            </div>
            <PageContent>
                {variant === "list" && (
                    <div className="grid gap-4">
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-60" />
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                        <div className="ring-foreground/10 divide-y overflow-hidden rounded-xl ring-1">
                            {Array.from({ length: 8 }, (_, row) => (
                                <div key={row} className="flex items-center gap-3 px-4 py-3">
                                    <Skeleton className="h-4 w-14" />
                                    <Skeleton className="h-4 flex-1" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {variant === "cards" && (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 3 }, (_, card) => (
                            <Skeleton key={card} className="h-32 rounded-xl" />
                        ))}
                    </div>
                )}
                {variant === "detail" && (
                    <div className="grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-72 rounded-xl" />
                    </div>
                )}
            </PageContent>
        </div>
    );
}
