import { InputType, PickType } from "@nestjs/graphql";

import { CreateEpicInput } from "./create-epic.input.js";

// An epic stays in its project
@InputType()
export class UpdateEpicInput extends PickType(CreateEpicInput, ["name", "description"] as const, InputType) {}
