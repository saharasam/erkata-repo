"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const jwt = __importStar(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET ||
    'E2N8cq8Hvk2CYFvq0jlxAdutt1h85yz4rlx9JbUQX7/6Y5LqlrDO9j7vYvkKO5HKnG5p2hcxOUR6Xy7eNyHfTw==';
async function main() {
    const agent = await prisma.profile.findFirst({
        where: { role: 'agent' },
    });
    if (!agent) {
        console.error('No agent found');
        return;
    }
    const payload = {
        sub: agent.id,
        email: 'agent@example.com',
        role: 'agent',
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    console.log(token);
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=gen_token.js.map