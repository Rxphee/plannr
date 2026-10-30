import { Module } from "@nestjs/common";

import { LabelsResolver } from "./labels.resolver.js";
import { LabelsService } from "./labels.service.js";

@Module({ providers: [LabelsResolver, LabelsService], exports: [LabelsService] })
export class LabelsModule {}
