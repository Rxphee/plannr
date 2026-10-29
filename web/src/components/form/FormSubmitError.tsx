"use client";

import { useFormState } from "react-final-form";

// Shows the error a submit returned as { [FORM_ERROR]: message }
export function FormSubmitError() {
    const { submitError } = useFormState({ subscription: { submitError: true } });
    if (!submitError) {
        return null;
    }

    return (
        <p className="text-destructive text-sm" aria-live="polite">
            {submitError}
        </p>
    );
}
