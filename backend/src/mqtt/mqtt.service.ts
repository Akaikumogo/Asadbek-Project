import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private readonly logger = new Logger(MqttService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const brokerUrl = this.configService.get<string>('MQTT_BROKER_URL') || 'mqtt://localhost:1883';
    const username = this.configService.get<string>('MQTT_USERNAME');
    const password = this.configService.get<string>('MQTT_PASSWORD');

    const options: mqtt.IClientOptions = {
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
    };

    if (username && password) {
      options.username = username;
      options.password = password;
    }

    this.client = mqtt.connect(brokerUrl, options);

    this.client.on('connect', () => {
      this.logger.log('✅ Connected to MQTT broker');
    });

    this.client.on('error', (error) => {
      this.logger.error('❌ MQTT connection error:', error);
    });

    this.client.on('reconnect', () => {
      this.logger.warn('🔄 Reconnecting to MQTT broker...');
    });

    this.client.on('offline', () => {
      this.logger.warn('⚠️ MQTT client is offline');
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      this.client.end();
      this.logger.log('MQTT client disconnected');
    }
  }

  async publish(topic: string, message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        return reject(new Error('MQTT client is not connected'));
      }

      this.client.publish(topic, message, { qos: 1 }, (error) => {
        if (error) {
          this.logger.error(`Failed to publish to topic ${topic}:`, error);
          reject(error);
        } else {
          this.logger.log(`📤 Published to ${topic}: ${message}`);
          resolve();
        }
      });
    });
  }

  async subscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        return reject(new Error('MQTT client is not connected'));
      }

      this.client.subscribe(topic, { qos: 1 }, (error) => {
        if (error) {
          this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
          reject(error);
        } else {
          this.logger.log(`📥 Subscribed to ${topic}`);
          resolve();
        }
      });
    });
  }

  onMessage(callback: (topic: string, message: Buffer) => void): void {
    this.client.on('message', callback);
  }
}

