#!/data/data/com.termux/files/usr/bin/bash

# First, with the help of Google Play (Android AppStore):
# - Install TermUX
# - Install TermUX:API

# Activate Access Point

# Manually do the following commands:
# apt update
# apt install wget
# wget http://trolen.polytech.unice.fr/tmp/termux-config.sh
# chmod a+x termux-config.sh
# ./termux-config.sh

# Determin Compute IP address
IP=`ifconfig wlan0 | grep "inet " | cut -d ' ' -f 10`

# Update/Upgrade installed system
echo "Updating/Upgrading system and installing wget..."
apt update
apt upgrade -y 

# Install wget
apt install -y wget
echo "System upgraded and wget installed."
echo

# Install OpenSSH
echo "Installing OpenSSH..."
apt install -y openssh
echo "OpenSSH installed."
echo

echo "Setting up password authentication..."
echo "PasswordAuthentication yes" >> $PREFIX/etc/ssh/ssh_config
echo "Enter a user password:"
passwd
result="$?"
while [ "$result" != "0" ]
do
	echo "Password not correctly set. Retry..."
	passwd
	result="$?"
done
echo "Password correctly set !"
echo

echo "Start OpenSSH server..."
sshd
echo "OpenSSH server started."
echo

# From your PC
echo "Setting up public key authentication..."
echo " From you PC, type the following command:"
echo "ssh-copy-id -p 8022 -i id_rsa $IP"
echo "Press \"Enter\" key when done..."
read
while [ ! -e "$HOME/.ssh/authorized_keys" ]
do
  echo "Authorized_keys is not properly set. Retry..."
	echo "Press \"Enter\" key when done..."
	read
done
echo

# Disable password authentication
echo "Disabling password authentication..."
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/g' $PREFIX/etc/ssh/ssh_config
echo "Password authentication disabled."
echo

# Restart OpenSSH server
echo "Restarting OpenSSH server..."
pkill sshd
sshd
echo "OpenSSH server restarted."
echo

# Print Configuration
echo "You are now able to connect with:"
echo " ssh -p 8022 $IP"
echo

# Should add sshd to a .profile file to start it automatically ?