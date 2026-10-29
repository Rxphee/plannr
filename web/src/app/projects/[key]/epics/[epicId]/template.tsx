import { ScrollToTop } from "@src/components/layout/ScrollToTop";
import type { PropsWithChildren } from "react";

// Remounts for every new page of this kind, but not for changed search params like the filters
export default function EpicTemplate({ children }: PropsWithChildren) {
    return (
        <>
            <ScrollToTop />
            {children}
        </>
    );
}
