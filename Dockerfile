FROM influxdb:2.0

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY collect_mqtt.js .
COPY run.sh .

RUN chmod a+x run.sh

CMD [ "./run.sh" ]