import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Transaction } from './transaction.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? '*',
  },
})
export class TransactionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TransactionsGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /** Called by TransactionsService right after a new row is persisted. */
  emitNewTransaction(transaction: Transaction) {
    this.server.emit('transaction:new', transaction);
  }
}