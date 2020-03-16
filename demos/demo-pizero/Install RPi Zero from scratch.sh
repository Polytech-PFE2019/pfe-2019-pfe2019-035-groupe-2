#---------------
# Install system
#---------------

# Flash Raspbian wuth Win32DiskImager
# Create "ssh" file in the boot partition
# Create "wpa_supplicant.conf" in the boot partition with the following text
##
country=fr
update_config=1
ctrl_interface=/var/run/wpa_supplicant

network={
scan_ssid=1
ssid="MiniTweedy"
psk="xpad#3000nce"
}
##

# Boot Raspberry Pi Zero W with the created SD Card
# ssh pi@raspberrypi.local

#---------------
# Sytem configure
#---------------
sudo apt-get update && sudo apt-get upgrade
sudo apt-get install i2c-tools git
sudo raspi-config
# configure timezone

#---------------
# Grove Base Hat
#---------------
# https://github.com/Seeed-Studio/grove.py#installation

sudo apt-get install python-pip python3-pip
curl -sL https://github.com/Seeed-Studio/grove.py/raw/master/install.sh | sudo bash -s -

git clone https://github.com/Seeed-Studio/grove.py
cd grove.py
# Python2
sudo pip install .
# Python3
sudo pip3 install .

#---------------
# Node-RED
#---------------
bash <(curl -sL https://raw.githubusercontent.com/node-red/raspbian-deb-package/master/resources/update-nodejs-and-nodered)

cd ~/.node-red
npm install node-red-dashboard # node-red-contrib-grovepi

#---------------
# Node.JS via NVM
#---------------
# https://github.com/cncjs/cncjs/wiki/Setup-Guide:-Raspberry-Pi-%7C-Install-Node.js-via-Node-Version-Manager-(NVM)

# Install Node Version Manager (NVM)
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

# Rerun Profile script to start NVM
source ~/.bashrc  # Rerun profile after installing nvm

# Install Node.js using Node Version Manager
nvm install 8  # Installs Node v8, (nvm install stable) installs Latest version of node
nvm use 8  # Sets Node to use v8

#---------------
# Docker
#---------------

# Install current docker programs to get dependencies
curl -fsSL https://get.docker.com | sh

# Docker specific version install to avoid issue/bug on lastest release (18.09.0)
sudo apt-get install docker-ce=18.06.2~ce~3-0~raspbian

sudo usermod -aG docker pi

sudo mkdir -p /etc/systemd/system/docker.service.d
sudo sh -c 'echo "[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H tcp://0.0.0.0:2376 -H unix:///var/run/docker.sock
" > /etc/systemd/system/docker.service.d/startup_options.conf'

sudo sh -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'

sudo systemctl daemon-reload
sudo systemctl enable docker.service