import { TextSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { useImageUploadTarget } from "./ImageUploadProvider";
import { imageAltText, uploadImage } from "./uploadImage";

// Uploads pasted, dropped and chosen images to the project of the editor and inserts them where the cursor is
export function useImageUploads() {
    const target = useImageUploadTarget();
    const t = useTranslations("richText");
    const [pendingUploads, setPendingUploads] = useState(0);

    // Returns whether it took the files, so other files (e.g. a PDF) keep the default behaviour of the editor.
    // A drop passes its position, so the images land where they were dropped.
    const insertImages = (view: EditorView, files: File[], position?: number): boolean => {
        const images = files.filter((file) => file.type.startsWith("image/"));
        if (!target || !view.editable || images.length === 0) {
            return false;
        }
        if (!target.isEnabled) {
            toast.error(t("imageUploadErrors.notSetUp"));
            return true;
        }
        if (position !== undefined) {
            view.dispatch(view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(position))));
        }

        for (const file of images) {
            setPendingUploads((count) => count + 1);
            void uploadImage(target.projectKey, file)
                .then((result) => {
                    if ("error" in result) {
                        toast.error(t(`imageUploadErrors.${result.error}`));
                        return;
                    }
                    // The editor may be gone by now, e.g. when its dialog was closed during the upload
                    if (view.isDestroyed) {
                        return;
                    }
                    const image = view.state.schema.nodes.image.create({ src: result.url, alt: imageAltText(file.name) });
                    view.dispatch(view.state.tr.replaceSelectionWith(image));
                })
                .finally(() => setPendingUploads((count) => count - 1));
        }
        return true;
    };

    return { isEnabled: target?.isEnabled ?? false, isUploading: pendingUploads > 0, insertImages };
}
