import { Button } from "@src/components/ui/Button";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

// Turns red on hover, because it throws away the filters or the search the user set
export function ResetButton({ onClick }: { onClick: () => void }) {
    const t = useTranslations("common");

    return (
        <Button variant="ghost" onClick={onClick} className="hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20">
            {t("reset")}
            <XIcon />
        </Button>
    );
}
