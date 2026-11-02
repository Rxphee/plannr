import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

// Changes the search params of a paginated list in place, e.g. its search or sort, keeping the others such as the view or the page size
export function useListSearchParams() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [pending, startTransition] = useTransition();

    const changeSearchParams = (change: (nextSearchParams: URLSearchParams) => void) => {
        const nextSearchParams = new URLSearchParams(searchParams);
        // Another search or order starts again on the first page
        nextSearchParams.delete("page");
        change(nextSearchParams);
        const query = nextSearchParams.toString();
        startTransition(() => {
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        });
    };

    return { searchParams, changeSearchParams, pending };
}
