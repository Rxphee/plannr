"use client";

import type { SubmissionErrors } from "final-form";
import type { ReactNode } from "react";
import { Form, type FormRenderProps } from "react-final-form";

interface FinalFormProps<FormValues> {
    onSubmit: (values: FormValues) => Promise<SubmissionErrors | void> | SubmissionErrors | void;
    initialValues?: Partial<FormValues>;
    className?: string;
    children: (formRenderProps: FormRenderProps<FormValues>) => ReactNode;
}

// Like FinalForm of the Dextinity admin: the react-final-form state and the HTML form in one component.
// Unlike there, the submit error is placed with FormSubmitError, e.g. above a dialog footer.
export function FinalForm<FormValues>({ onSubmit, initialValues, className, children }: FinalFormProps<FormValues>) {
    return (
        <Form<FormValues>
            onSubmit={onSubmit}
            initialValues={initialValues}
            render={(formRenderProps) => (
                // The fields validate themselves, so the browser's own validation stays off
                <form onSubmit={formRenderProps.handleSubmit} noValidate className={className}>
                    {children(formRenderProps)}
                </form>
            )}
        />
    );
}
