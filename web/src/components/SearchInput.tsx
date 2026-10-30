import { Input } from "@src/components/ui/Input";
import { cn } from "@src/lib/utils";
import { SearchIcon } from "lucide-react";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
    className?: string;
}

export function SearchInput({ value, onChange, placeholder, label, className }: SearchInputProps) {
    return (
        <div className={cn("relative w-full sm:w-60", className)}>
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                aria-label={label}
                className="pl-8"
            />
        </div>
    );
}
