"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediationProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
let MediationProcessor = class MediationProcessor extends bullmq_1.WorkerHost {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async process(job) {
        if (job.name === 'feedback-timeout') {
            await this.handleTimeout(job);
        }
        return undefined;
    }
    async handleTimeout(job) {
        const { transactionId } = job.data;
        const bundle = await this.prisma.feedbackBundle.findUnique({
            where: { transactionId },
        });
        if (!bundle)
            return;
        const state = bundle.state;
        if (state === 'WAITING_BOTH' ||
            state === 'WAITING_AGENT' ||
            state === 'WAITING_CUSTOMER') {
            const timedOutState = 'TIMED_OUT';
            await this.prisma.feedbackBundle.update({
                where: { transactionId },
                data: {
                    state: timedOutState,
                    stateHistory: {
                        push: {
                            from: state,
                            to: 'TIMED_OUT',
                            at: new Date().toISOString(),
                            by: 'SYSTEM',
                            reason: '14-day feedback window expired',
                        },
                    },
                },
            });
        }
    }
};
exports.MediationProcessor = MediationProcessor;
exports.MediationProcessor = MediationProcessor = __decorate([
    (0, bullmq_1.Processor)('mediation'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediationProcessor);
//# sourceMappingURL=mediation.processor.js.map