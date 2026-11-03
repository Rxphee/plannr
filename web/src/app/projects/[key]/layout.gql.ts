import { gql } from "@src/util/gql";

export const projectLayoutQuery = gql`
    query ProjectLayout {
        imageUploadsEnabled
    }
`;
