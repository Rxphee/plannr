import { ImageUploadProvider } from "@src/components/richText/ImageUploadProvider";
import { graphQLFetch } from "@src/util/graphQLFetch";

import { projectLayoutQuery } from "./layout.gql";
import type { GQLProjectLayoutQuery } from "./layout.gql.generated";

// The editors of a project upload their images into it
export default async function ProjectLayout({ children, params }: LayoutProps<"/projects/[key]">) {
    const { key } = await params;
    const { imageUploadsEnabled } = await graphQLFetch<GQLProjectLayoutQuery>(projectLayoutQuery);

    return (
        <ImageUploadProvider projectKey={key} isEnabled={imageUploadsEnabled}>
            {children}
        </ImageUploadProvider>
    );
}
