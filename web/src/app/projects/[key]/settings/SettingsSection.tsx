import type { PropsWithChildren } from "react";

interface SettingsSectionProps {
    title: string;
    description: string;
}

export function SettingsSection({ title, description, children }: PropsWithChildren<SettingsSectionProps>) {
    // Two columns depend on the section's own width, not the viewport, because the sidebar can leave too little room for them
    return (
        <section className="@container border-b py-8 first:pt-0 last:border-b-0">
            <div className="grid gap-4 @3xl:grid-cols-[14rem_1fr] @3xl:gap-8">
                <div className="grid content-start gap-1">
                    <h2 className="font-heading font-semibold">{title}</h2>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
                <div className="min-w-0">{children}</div>
            </div>
        </section>
    );
}
