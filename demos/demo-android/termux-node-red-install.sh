#!/data/data/com.termux/files/usr/bin/bash

# Install Node.js
which node > /dev/null
if [ "$?" != "0" ]
then
	echo "Installing Node.js..."
	apt install -y coreutils nodejs
	echo "Node.js installed."
else
	echo "Node.js already installed."
fi
echo

# Install Node-RED
which node-red > /dev/null
if [ "$?" != "0" ]
then
	echo "Installing Node-RED..."
	npm i -g --unsafe-perm node-red
	echo "Node-RED installed."
else
	echo "Node-RED already installed."
fi

# Install termUX:API to allow node-red-contrib-termux-api nodes to work 
echo "Installing termux-api..."
apt install -y termux-api # https://wiki.termux.com/wiki/Termux:API
echo "termux-api installed."
echo

# # To run node-red
# node-red

# # To install node packages
# cd ~/.node-red
# npm install node-red-dashboard node-red-contrib-termux-api
