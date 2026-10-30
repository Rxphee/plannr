import type { SelectOption } from "@src/components/OptionSelect";
import type { GQLLabelColor } from "@src/graphql.generated";

import { LabelColorDot } from "./LabelBadge";

// The options of the label field of an issue and the label filter, with the color before the name
export function toLabelSelectOptions(labels: { id: string; name: string; color: GQLLabelColor }[]): SelectOption[] {
    return labels.map((label) => ({ value: label.id, label: label.name, icon: <LabelColorDot color={label.color} /> }));
}
