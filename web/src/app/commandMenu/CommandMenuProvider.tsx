"use client";

import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";

import type { QuickCaptureProject } from "./AppCommands";
import { CommandMenu } from "./CommandMenu";
import { isCommandMenuShortcut, isQuickCaptureShortcut } from "./keyboardShortcuts";
import { QuickCaptureDialog } from "./QuickCaptureDialog";

interface CommandMenuContextValue {
    openCommandMenu: () => void;
}

const CommandMenuContext = createContext<CommandMenuContextValue>({ openCommandMenu: () => {} });

export function useCommandMenu(): CommandMenuContextValue {
    return useContext(CommandMenuContext);
}

// Opens the command menu with ⌘K or Ctrl+K and the quick capture with C, on every page
export function CommandMenuProvider({ projects, children }: PropsWithChildren<{ projects: QuickCaptureProject[] }>) {
    const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
    const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
    const canCapture = projects.length > 0;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isCommandMenuShortcut(event)) {
                event.preventDefault();
                setIsCommandMenuOpen((isOpen) => !isOpen);
            } else if (canCapture && isQuickCaptureShortcut(event)) {
                event.preventDefault();
                setIsQuickCaptureOpen(true);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [canCapture]);

    return (
        <CommandMenuContext value={{ openCommandMenu: () => setIsCommandMenuOpen(true) }}>
            {children}
            <CommandMenu
                open={isCommandMenuOpen}
                onOpenChange={setIsCommandMenuOpen}
                onQuickCapture={
                    canCapture
                        ? () => {
                              setIsCommandMenuOpen(false);
                              setIsQuickCaptureOpen(true);
                          }
                        : undefined
                }
            />
            {canCapture && <QuickCaptureDialog projects={projects} open={isQuickCaptureOpen} onOpenChange={setIsQuickCaptureOpen} />}
        </CommandMenuContext>
    );
}
