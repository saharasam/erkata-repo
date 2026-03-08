"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediationModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const mediation_service_1 = require("./mediation.service");
const mediation_controller_1 = require("./mediation.controller");
const mediation_processor_1 = require("./mediation.processor");
const common_module_1 = require("../common/common.module");
let MediationModule = class MediationModule {
};
exports.MediationModule = MediationModule;
exports.MediationModule = MediationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'mediation',
            }),
            common_module_1.CommonModule,
        ],
        providers: [mediation_service_1.MediationService, mediation_processor_1.MediationProcessor],
        controllers: [mediation_controller_1.MediationController],
        exports: [mediation_service_1.MediationService],
    })
], MediationModule);
//# sourceMappingURL=mediation.module.js.map