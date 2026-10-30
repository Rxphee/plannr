import { BadRequestException } from "@nestjs/common";
import { type ClassConstructor, plainToInstance } from "class-transformer";
import { validateSync, type ValidationError } from "class-validator";

// Runs the class-validator rules of a GraphQL input on tool arguments, so MCP checks the same rules as the global ValidationPipe
export function validateInput<Input extends object>(type: ClassConstructor<Input>, plain: object): Input {
    const input = plainToInstance(type, plain);
    const errors = validateSync(input, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > 0) {
        throw new BadRequestException(errors.flatMap(messagesOf).join(", "));
    }
    return input;
}

function messagesOf({ constraints = {}, children = [] }: ValidationError): string[] {
    return [...Object.values(constraints), ...children.flatMap(messagesOf)];
}
