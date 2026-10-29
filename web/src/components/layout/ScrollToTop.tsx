"use client";

import { useEffect } from "react";

// Next.js keeps the scroll position when the new page starts within the viewport, which it always does below the sticky header.
// A page with this component starts at the top instead.
export function ScrollToTop() {
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    return null;
}
