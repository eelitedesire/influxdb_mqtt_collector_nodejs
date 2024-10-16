#!/bin/bash

# Start InfluxDB
influxd &

# Wait for InfluxDB to start
sleep 10

# Set up InfluxDB
influx setup --username admin --password adminpassword --org home_assistant --bucket home_assistant --force

# Get the admin token
export INFLUXDB_TOKEN=$(influx auth list --user admin --hide-headers | cut -f 3)

# Start the MQTT collector
node /app/collect_mqtt.js