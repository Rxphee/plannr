"use server";

import type { GQLAddProjectMembersInput, GQLProjectMemberInput, GQLProjectStatus, GQLUpdateProjectInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation } from "@src/util/runMutation";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
    addProjectMembersMutation,
    changeProjectMemberRoleMutation,
    changeProjectStatusMutation,
    deleteProjectMutation,
    projectAccessQuery,
    removeProjectMemberMutation,
    updateProjectMutation,
} from "./actions.gql";
import type {
    GQLAddProjectMembersMutation,
    GQLAddProjectMembersMutationVariables,
    GQLChangeProjectMemberRoleMutation,
    GQLChangeProjectMemberRoleMutationVariables,
    GQLChangeProjectStatusMutation,
    GQLChangeProjectStatusMutationVariables,
    GQLDeleteProjectMutation,
    GQLDeleteProjectMutationVariables,
    GQLProjectAccessQuery,
    GQLProjectAccessQueryVariables,
    GQLRemoveProjectMemberMutation,
    GQLRemoveProjectMemberMutationVariables,
    GQLUpdateProjectMutation,
    GQLUpdateProjectMutationVariables,
} from "./actions.gql.generated";

export async function updateProject(id: string, input: GQLUpdateProjectInput): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLUpdateProjectMutation, GQLUpdateProjectMutationVariables>(updateProjectMutation, { id, input }), {
        errorMessage: t("saveProject"),
    });
}

export async function changeProjectStatus(id: string, status: GQLProjectStatus): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(
        () => graphQLFetch<GQLChangeProjectStatusMutation, GQLChangeProjectStatusMutationVariables>(changeProjectStatusMutation, { id, status }),
        { errorMessage: t("changeProjectStatus") },
    );
}

export async function deleteProject(id: string): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLDeleteProjectMutation, GQLDeleteProjectMutationVariables>(deleteProjectMutation, { id }), {
        errorMessage: t("deleteProject"),
        onSuccess: () => redirect("/projects"),
    });
}

export async function addProjectMembers(input: GQLAddProjectMembersInput): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(
        () => graphQLFetch<GQLAddProjectMembersMutation, GQLAddProjectMembersMutationVariables>(addProjectMembersMutation, { input }),
        {
            errorMessage: t("addMembers"),
        },
    );
}

export async function changeProjectMemberRole(projectKey: string, input: GQLProjectMemberInput): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(
        () =>
            graphQLFetch<GQLChangeProjectMemberRoleMutation, GQLChangeProjectMemberRoleMutationVariables>(changeProjectMemberRoleMutation, { input }),
        { errorMessage: t("changeRole"), onSuccess: () => refreshOrLeaveSettings(projectKey) },
    );
}

export async function removeProjectMember(projectKey: string, variables: GQLRemoveProjectMemberMutationVariables): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(
        () => graphQLFetch<GQLRemoveProjectMemberMutation, GQLRemoveProjectMemberMutationVariables>(removeProjectMemberMutation, variables),
        {
            errorMessage: t("removeMember"),
            onSuccess: () => refreshOrLeaveSettings(projectKey),
        },
    );
}

// Users who remove themselves or give up their owner role can no longer open the settings
async function refreshOrLeaveSettings(projectKey: string): Promise<void> {
    const { project } = await graphQLFetch<GQLProjectAccessQuery, GQLProjectAccessQueryVariables>(projectAccessQuery, { key: projectKey });
    if (!project) {
        redirect("/projects");
    }
    if (!project.canManage) {
        redirect(`/projects/${projectKey}`);
    }
    refresh();
}
