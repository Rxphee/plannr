// Tagged template for GraphQL documents. It only returns the query string; its name lets GraphQL Code Generator find the documents.
export function gql(strings: TemplateStringsArray, ...values: string[]): string {
    return strings.reduce((query, string, index) => query + string + (values[index] ?? ""), "");
}
