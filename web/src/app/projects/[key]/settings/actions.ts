"use server";

import type { GQLAddProjectMembersInput, GQLProjectMemberInput, GQLProjectStatus, GQLUpdateProjectInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation } from "@src/util/runMutation";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";

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
    return runMutation(() => graphQLFetch<GQLUpdateProjectMutation, GQLUpdateProjectMutationVariables>(updateProjectMutation, { id, input }), {
        errorMessage: "The project could not be saved.",
    });
}

export async function changeProjectStatus(id: string, status: GQLProjectStatus): Promise<{ error?: string }> {
    return runMutation(
        () => graphQLFetch<GQLChangeProjectStatusMutation, GQLChangeProjectStatusMutationVariables>(changeProjectStatusMutation, { id, status }),
        { errorMessage: "The status could not be changed." },
    );
}

export async function deleteProject(id: string): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLDeleteProjectMutation, GQLDeleteProjectMutationVariables>(deleteProjectMutation, { id }), {
        errorMessage: "The project could not be deleted.",
        onSuccess: () => redirect("/projects"),
    });
}

export async function addProjectMembers(input: GQLAddProjectMembersInput): Promise<{ error?: string }> {
    return runMutation(
        () => graphQLFetch<GQLAddProjectMembersMutation, GQLAddProjectMembersMutationVariables>(addProjectMembersMutation, { input }),
        {
            errorMessage: "The members could not be added.",
        },
    );
}

export async function changeProjectMemberRole(projectKey: string, input: GQLProjectMemberInput): Promise<{ error?: string }> {
    return runMutation(
        () =>
            graphQLFetch<GQLChangeProjectMemberRoleMutation, GQLChangeProjectMemberRoleMutationVariables>(changeProjectMemberRoleMutation, { input }),
        { errorMessage: "The role could not be changed.", onSuccess: () => refreshOrLeaveSettings(projectKey) },
    );
}

export async function removeProjectMember(projectKey: string, variables: GQLRemoveProjectMemberMutationVariables): Promise<{ error?: string }> {
    return runMutation(
        () => graphQLFetch<GQLRemoveProjectMemberMutation, GQLRemoveProjectMemberMutationVariables>(removeProjectMemberMutation, variables),
        {
            errorMessage: "The member could not be removed.",
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
