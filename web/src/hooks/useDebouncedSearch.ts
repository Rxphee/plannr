import { useEffect, useRef, useState } from "react";

const SEARCH_DELAY_MS = 300;

// The text of a search field that is applied once the user pauses typing, not on every key
export function useDebouncedSearch(initialSearch: string, applySearch: (search?: string) => void) {
    const [search, setSearch] = useState(initialSearch);
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

    const changeSearch = (value: string) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => applySearch(value.trim() || undefined), SEARCH_DELAY_MS);
    };

    // Empties the field without applying it, for a reset that applies the search together with other changes
    const clearSearch = () => {
        clearTimeout(searchTimeout.current);
        setSearch("");
    };

    useEffect(() => () => clearTimeout(searchTimeout.current), []);

    return { search, changeSearch, clearSearch };
}
