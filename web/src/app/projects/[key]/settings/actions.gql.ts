import { gql } from "@src/util/gql";

export const updateProjectMutation = gql`
    mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
        updateProject(id: $id, input: $input) {
            id
        }
    }
`;

export const changeProjectStatusMutation = gql`
    mutation ChangeProjectStatus($id: ID!, $status: ProjectStatus!) {
        changeProjectStatus(id: $id, status: $status) {
            id
        }
    }
`;

export const deleteProjectMutation = gql`
    mutation DeleteProject($id: ID!) {
        deleteProject(id: $id)
    }
`;

export const addProjectMemberMutation = gql`
    mutation AddProjectMember($input: ProjectMemberInput!) {
        addProjectMember(input: $input) {
            role
        }
    }
`;

export const changeProjectMemberRoleMutation = gql`
    mutation ChangeProjectMemberRole($input: ProjectMemberInput!) {
        changeProjectMemberRole(input: $input) {
            role
        }
    }
`;

export const removeProjectMemberMutation = gql`
    mutation RemoveProjectMember($projectId: ID!, $userId: ID!) {
        removeProjectMember(projectId: $projectId, userId: $userId)
    }
`;

export const projectAccessQuery = gql`
    query ProjectAccess($key: String!) {
        project(key: $key) {
            canManage
        }
    }
`;
