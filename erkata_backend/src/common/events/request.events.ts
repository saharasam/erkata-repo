import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class RequestEventListener {
  @OnEvent('request.created')
  handleRequestCreated(payload: any) {
    // TODO: Query Operators whose zones match payload.locationZone, create Notification records
    console.log(
      `[EVENT] request.created → id=${payload.id}, zone=${JSON.stringify(payload.locationZone)}`,
    );
  }

  @OnEvent('transaction.created')
  handleTransactionCreated(payload: { transaction: any; agentId: string }) {
    // TODO: Push notification to Agent
    console.log(
      `[EVENT] transaction.created → id=${payload.transaction.id}, agentId=${payload.agentId}`,
    );
  }

  @OnEvent('transaction.accepted')
  handleTransactionAccepted(payload: any) {
    // TODO: Notify Customer "Your agent has accepted — you can now see their contact details"
    console.log(`[EVENT] transaction.accepted → id=${payload.id}`);
  }

  @OnEvent('transaction.declined')
  handleTransactionDeclined(payload: {
    transactionId: string;
    agentId: string;
  }) {
    // TODO: Notify Operator so they can re-assign
    console.log(
      `[EVENT] transaction.declined → id=${payload.transactionId}, agentId=${payload.agentId}`,
    );
  }

  @OnEvent('transaction.completed')
  handleTransactionCompleted(payload: any) {
    // TODO: Notify Customer to submit feedback; open the 14-day feedback window
    console.log(`[EVENT] transaction.completed → id=${payload.id}`);
  }
}
