"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
console.log('Available models:', Object.keys(prisma).filter((k) => !k.startsWith('$')));
process.exit(0);
//# sourceMappingURL=check_prisma.js.map