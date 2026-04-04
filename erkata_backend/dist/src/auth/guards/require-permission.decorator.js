"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermission = void 0;
const common_1 = require("@nestjs/common");
const RequirePermission = (...actions) => (0, common_1.SetMetadata)('actions', actions);
exports.RequirePermission = RequirePermission;
//# sourceMappingURL=require-permission.decorator.js.map