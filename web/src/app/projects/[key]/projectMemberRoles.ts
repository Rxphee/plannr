import type { GQLProjectMemberRole } from "@src/graphql.generated";

export const projectMemberRoleOptions: { value: GQLProjectMemberRole; label: string }[] = [
    { value: "owner", label: "Owner" },
    { value: "member", label: "Member" },
    { value: "viewer", label: "Viewer" },
];

export const projectMemberRoleLabels = Object.fromEntries(projectMemberRoleOptions.map(({ value, label }) => [value, label])) as Record<
    GQLProjectMemberRole,
    string
>;
