const mqtt = require('mqtt');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// InfluxDB configuration
const INFLUXDB_URL = 'http://localhost:8086';
const INFLUXDB_TOKEN = process.env.INFLUXDB_TOKEN;
const INFLUXDB_ORG = 'home_assistant';
const INFLUXDB_BUCKET = process.env.INFLUXDB_BUCKET || 'home_assistant';

// MQTT configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'core-mosquitto';
const MQTT_PORT = 1883;
const MQTT_TOPIC = process.env.MQTT_TOPIC || '#';

// Set up InfluxDB client
const influxDB = new InfluxDB({ url: INFLUXDB_URL, token: INFLUXDB_TOKEN });
const writeApi = influxDB.getWriteApi(INFLUXDB_ORG, INFLUXDB_BUCKET);

// Set up MQTT client
const client = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(MQTT_TOPIC, (err) => {
    if (!err) {
      console.log(`Subscribed to ${MQTT_TOPIC}`);
    }
  });
});

client.on('message', (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    const point = new Point(topic);

    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === 'number') {
        point.floatField(key, value);
      }
    }

    writeApi.writePoint(point);
    console.log(`Saved data from topic ${topic}`);
  } catch (error) {
    console.error(`Error processing message: ${error}`);
  }
});

process.on('SIGINT', () => {
  writeApi
    .close()
    .then(() => {
      console.log('InfluxDB write finished');
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
});

console.log('MQTT to InfluxDB collector started');