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
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- System Configs ---');
    const configs = await prisma.systemConfig.findMany();
    console.table(configs);
    console.log('--- Matches Status ---');
    const matches = await prisma.match.findMany({
        include: {
            agent: { select: { fullName: true, email: true } },
            request: true,
        }
    });
    console.table(matches.map(m => ({
        id: m.id.substring(0, 8),
        agent: m.agent.fullName,
        email: m.agent.email,
        status: m.status,
        budget: m.request.budgetMax?.toString() || m.request.budgetMin?.toString() || '0',
    })));
    console.log('--- Profile AGLP Balances ---');
    const profiles = await prisma.profile.findMany({
        where: { role: 'agent' },
        select: {
            email: true,
            fullName: true,
            aglpBalance: true,
            tier: true,
        }
    });
    console.table(profiles.map(p => ({
        ...p,
        aglpBalance: p.aglpBalance.toString(),
    })));
    console.log('--- Packages ---');
    const packages = await prisma.package.findMany();
    console.table(packages.map(p => ({
        ...p,
        price: p.price.toString(),
    })));
    console.log('--- AGLP Transactions ---');
    const txs = await prisma.aglpTransaction.findMany();
    console.table(txs);
    console.log('--- Audit Logs (Finance Related) ---');
    const logs = await prisma.auditLog.findMany({
        where: {
            action: {
                contains: 'EARNED'
            }
        },
        take: 20,
        orderBy: { createdAt: 'desc' }
    });
    console.table(logs);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check_diag.js.map