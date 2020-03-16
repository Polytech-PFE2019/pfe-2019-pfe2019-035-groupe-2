FROM arm32v6/node:10.16.0-alpine

USER root

# Install extra packages to compile native npm packages
RUN apk --no-cache add --update bash tzdata git python python-dev py-pip make g++ linux-headers krb5-dev

# Add rpi.gpio to access GPIO port through out Python (and need by rpi-gpio nodes)
RUN pip install RPi.GPIO

# Clean npm cache and upgrade npm to latest release
RUN npm cache clean -f
RUN npm install npm@latest -g

# Install NodeRED
RUN npm install -g --unsafe-perm node-red
RUN mkdir -p /root/.node-red/node_modules

#ENV PATH="/usr/local/lib/node_modules/node-red/node_modules/@node-red/nodes/core/hardware:${PATH}"
# Specify timezone for demo part with correct Paris time.
ENV TZ=Europe/Paris

WORKDIR /root/.node-red

COPY package.json /root/.node-red/

# Install specific nodes to access Grove sensor/actuator with Grove Base Hat
RUN npm install https://github.com/lavirott/node-red-contrib-grovehat node-red-dashboard node-red-contrib-mqtt-broker

EXPOSE 1880

ENTRYPOINT ["node-red"]
