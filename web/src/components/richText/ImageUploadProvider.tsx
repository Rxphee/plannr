"use client";

import { createContext, type ReactNode, useContext } from "react";

type ImageUploadTarget = { projectKey: string; isEnabled: boolean };

const ImageUploadContext = createContext<ImageUploadTarget | null>(null);

// The project that the editors inside upload their images to. Editors outside a project, e.g. when creating one, take no images.
export function ImageUploadProvider({ projectKey, isEnabled, children }: ImageUploadTarget & { children: ReactNode }) {
    return <ImageUploadContext value={{ projectKey, isEnabled }}>{children}</ImageUploadContext>;
}

export function useImageUploadTarget(): ImageUploadTarget | null {
    return useContext(ImageUploadContext);
}
