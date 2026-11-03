import { Button } from "@src/components/ui/Button";
import { DownloadIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface ProjectExportButtonProps {
    projectKey: string;
}

// A plain link instead of next/link, since the route answers with a file to download, not a page
export async function ProjectExportButton({ projectKey }: ProjectExportButtonProps) {
    const t = await getTranslations("projectSettings");
    return (
        <Button variant="outline" nativeButton={false} render={<a href={`/projects/${projectKey}/export`} download />}>
            <DownloadIcon />
            {t("exportButton")}
        </Button>
    );
}
