import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import WebSocket from 'ws';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HaStateChangedEvent } from './HaStateChangedEvent';
import Constants from '../common/Constants';


@Injectable()
export class WebsocketEventListener implements OnModuleInit {
  private readonly logger = new Logger(WebsocketEventListener.name);
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private msgId = 1;
  
  private readonly HA_URL = `ws://${Constants.HOME_ASSISTANT_URL}/api/websocket`;
 

  constructor(private eventEmitter: EventEmitter2) {}

  onModuleInit() {
    if(Constants.HOME_ASSISTANT_INTEGRATION_ENABLED=='true'){
      this.connect();
    }
  }

  private nextId() {
    return this.msgId++;
  }

  private connect() {
    
    this.logger.debug(`Connecting to Home Assistant WebSocket ${Constants.HOME_ASSISTANT_URL} with auth token...`);
    this.ws = new WebSocket(this.HA_URL);

    this.ws.on('open', () => {
      this.logger.log('Connected to Home Assistant');
      this.reconnectAttempts = 0;
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === 'auth_required') {
        this.ws?.send(JSON.stringify({
          type: 'auth',
          access_token: Constants.HOME_ASSISTANT_TOKEN,
        }));
      }

      if (message.type === 'auth_ok') {
        this.logger.log('Authenticated successfully');
        this.ws?.send(JSON.stringify({
          id: this.nextId(),
          type: 'subscribe_events',
          event_type: 'state_changed',
        }));
      }

      if (message.type === 'event' && message.event?.event_type === 'state_changed') {
        const entityId = message.event.data.entity_id;
        const newState = message.event.data.new_state;
        const oldState = message.event.data.old_state;

        this.logger.debug(`Event: ${entityId} -> ${newState?.state}`);

        // 🔥 Emit to NestJS
        this.eventEmitter.emit(
          'ha.state_changed',
          new HaStateChangedEvent(entityId, newState, oldState)
        );
      }
    });

    this.ws.on('close', () => {
      this.logger.warn('WebSocket closed, reconnecting...');
      this.scheduleReconnect();
    });

    this.ws.on('error', (err) => {
      this.logger.error(`WebSocket error: ${err.message}`);
      this.ws?.close();
    });
  }

  private scheduleReconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.logger.log(`Reconnecting in ${delay / 1000}s...`);
    this.reconnectAttempts++;

    setTimeout(() => this.connect(), delay);
  }
}
