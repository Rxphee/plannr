import { PlusIcon } from "lucide-react";

import { CreateProjectDialog } from "./CreateProjectDialog";

// The last tile of the project grid, so creating a project is always where the projects are
export function NewProjectCard() {
    return (
        <CreateProjectDialog
            trigger={
                <button
                    type="button"
                    className="group text-muted-foreground hover:text-foreground hover:border-primary/60 hover:bg-primary/5 focus-visible:ring-ring flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                >
                    <span className="bg-muted group-hover:bg-primary group-hover:text-primary-foreground flex size-10 items-center justify-center rounded-lg transition-colors">
                        <PlusIcon className="size-5" />
                    </span>
                    New project
                </button>
            }
        />
    );
}
