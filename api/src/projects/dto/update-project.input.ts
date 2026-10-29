import { InputType, PickType } from "@nestjs/graphql";

import { CreateProjectInput } from "./create-project.input.js";

// The key stays out: it is fixed after creation because issue IDs like KEY-42 are built from it
@InputType()
export class UpdateProjectInput extends PickType(CreateProjectInput, ["name", "description"] as const, InputType) {}
