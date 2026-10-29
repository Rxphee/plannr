import { PlusIcon } from "lucide-react";

import { CreateProjectDialog } from "./CreateProjectDialog";

// The last tile of the project grid, so creating a project is always where the projects are
export function NewProjectCard() {
    return (
        <CreateProjectDialog
            trigger={
                <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/40 focus-visible:ring-ring flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                >
                    <span className="bg-muted flex size-10 items-center justify-center rounded-lg">
                        <PlusIcon className="size-5" />
                    </span>
                    New project
                </button>
            }
        />
    );
}
