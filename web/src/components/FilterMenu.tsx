"use client";

import { Menu } from "@base-ui/react/menu";
import { OptionLabel, type SelectOption } from "@src/components/OptionSelect";
import { Button } from "@src/components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@src/components/ui/DropdownMenu";
import { cn } from "@src/lib/utils";
import { CheckIcon, PlusCircleIcon, XIcon } from "lucide-react";

// Up to this many selected options are named in the trigger, more are counted
const MAX_NAMED_OPTIONS = 2;

interface FilterMenuProps<Value extends string> {
    label: string;
    options: SelectOption<Value>[];
    selected: Value[];
    onChange: (selected: Value[]) => void;
}

// A filter that matches any of the selected options, with checkboxes that keep the menu open
export function FilterMenu<Value extends string>({ label, options, selected, onChange }: FilterMenuProps<Value>) {
    const selectedOptions = options.filter((option) => selected.includes(option.value));

    const toggle = (value: Value, isChecked: boolean) => {
        // Keeps the order of the options, so the URL does not depend on the order of the clicks
        onChange(options.map((option) => option.value).filter((candidate) => (candidate === value ? isChecked : selected.includes(candidate))));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={<Button variant="outline" className={cn("gap-2", selectedOptions.length === 0 && "text-muted-foreground border-dashed")} />}
            >
                {selectedOptions.length === 0 && <PlusCircleIcon />}
                {label}
                {selectedOptions.length > 0 && (
                    <>
                        <span aria-hidden="true" className="bg-border h-4 w-px" />
                        {selectedOptions.length > MAX_NAMED_OPTIONS ? (
                            <span className="bg-muted rounded-md px-1.5 text-xs leading-5 font-medium">{selectedOptions.length} selected</span>
                        ) : (
                            selectedOptions.map((option) => (
                                <span key={option.value} className="bg-muted max-w-36 rounded-md px-1.5 text-xs leading-5 font-medium">
                                    <OptionLabel option={option} />
                                </span>
                            ))
                        )}
                    </>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto min-w-52">
                {options.map((option) => (
                    <Menu.CheckboxItem
                        key={option.value}
                        checked={selected.includes(option.value)}
                        onCheckedChange={(isChecked) => toggle(option.value, isChecked)}
                        closeOnClick={false}
                        className="group/filter-option data-highlighted:bg-accent flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm outline-hidden select-none"
                    >
                        <span className="border-input group-data-checked/filter-option:border-primary group-data-checked/filter-option:bg-primary flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-75">
                            <CheckIcon className="text-primary-foreground hidden size-3 group-data-checked/filter-option:block" strokeWidth={3} />
                        </span>
                        <OptionLabel option={option} />
                    </Menu.CheckboxItem>
                ))}
                {selectedOptions.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onChange([])}
                            className="text-muted-foreground focus:bg-destructive/10 focus:text-destructive focus:**:text-destructive dark:focus:bg-destructive/20"
                        >
                            <XIcon />
                            Clear filter
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
