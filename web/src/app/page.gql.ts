import { gql } from "@src/util/gql";

export const apiStatusQuery = gql`
    query ApiStatus {
        status
    }
`;
