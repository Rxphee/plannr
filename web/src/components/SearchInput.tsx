import { ClearButton } from "@src/components/ClearButton";
import { Input } from "@src/components/ui/Input";
import { cn } from "@src/lib/utils";
import { SearchIcon } from "lucide-react";
import { useRef } from "react";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    // Applies the empty search at once, without waiting for a pause in typing
    onClear: () => void;
    placeholder: string;
    label: string;
    className?: string;
}

export function SearchInput({ value, onChange, onClear, placeholder, label, className }: SearchInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const clear = () => {
        onClear();
        inputRef.current?.focus();
    };

    return (
        <div className={cn("relative w-full sm:w-60", className)}>
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
                ref={inputRef}
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                aria-label={label}
                // The own clear button replaces the one of the browser, which is small and cannot be styled
                className="pr-9 pl-8 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {value && <ClearButton onClick={clear} className="absolute top-1/2 right-1 -translate-y-1/2" />}
        </div>
    );
}
