import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  jwtSecret: process.env.JWT_SECRET || 'change_me_in_prod',
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  mqttUrl: process.env.MQTT_URL || 'mqtt://localhost:1883',
  mqttUsername: process.env.MQTT_USERNAME,
  mqttPassword: process.env.MQTT_PASSWORD,
  timescale: (process.env.TIMESCALE || 'true') === 'true'
};


