import { connect, IClientPublishOptions, MqttClient } from 'mqtt';
import { env } from '../env.js';

let client: MqttClient | null = null;

export function getMqtt(): MqttClient {
  if (client) return client;
  client = connect(env.mqttUrl, {
    username: env.mqttUsername,
    password: env.mqttPassword,
    reconnectPeriod: 2000,
    keepalive: 60
  });

  client.on('connect', () => {
    // Subscribe to telemetry topics
    client?.subscribe([
      'pump/+/+/status',
      'pump/+/+/metrics',
      'device/+/net',
      'device/+/level',
      'ack/+',
      'nak/+'
    ]);
  });

  client.on('error', (err) => {
    console.error('MQTT error:', err.message);
  });

  return client;
}

export function publish(topic: string, payload: unknown, options?: IClientPublishOptions): Promise<void> {
  const cli = getMqtt();
  return new Promise((resolve, reject) => {
    cli.publish(topic, JSON.stringify(payload), { qos: 1, ...options }, (err?: Error) => {
      if (err) reject(err);
      else resolve();
    });
  });
}


