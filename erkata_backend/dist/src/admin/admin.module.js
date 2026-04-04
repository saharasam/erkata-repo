"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const config_controller_1 = require("./config.controller");
const audit_logs_controller_1 = require("./audit-logs.controller");
const admins_controller_1 = require("./admins.controller");
const analytics_controller_1 = __importDefault(require("./analytics.controller"));
const system_broadcasts_controller_1 = __importDefault(require("./system-broadcasts.controller"));
const payouts_controller_1 = require("./payouts.controller");
const common_module_1 = require("../common/common.module");
const prisma_module_1 = require("../prisma/prisma.module");
const aglp_module_1 = require("../aglp/aglp.module");
const invite_module_1 = require("../auth/invite/invite.module");
const users_module_1 = require("../users/users.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule, prisma_module_1.PrismaModule, aglp_module_1.AglpModule, invite_module_1.InviteModule, users_module_1.UsersModule],
        controllers: [
            config_controller_1.AdminConfigController,
            audit_logs_controller_1.AuditLogsController,
            admins_controller_1.AdminsController,
            analytics_controller_1.default,
            system_broadcasts_controller_1.default,
            payouts_controller_1.PayoutsController,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map