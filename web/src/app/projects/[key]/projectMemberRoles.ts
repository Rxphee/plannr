import type { GQLProjectMemberRole } from "@src/graphql.generated";

// Ordered from the most rights to the fewest
export const PROJECT_MEMBER_ROLES: GQLProjectMemberRole[] = ["owner", "member", "viewer"];
