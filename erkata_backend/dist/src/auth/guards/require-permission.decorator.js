"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermission = void 0;
const common_1 = require("@nestjs/common");
const RequirePermission = (action) => (0, common_1.SetMetadata)('action', action);
exports.RequirePermission = RequirePermission;
//# sourceMappingURL=require-permission.decorator.js.map