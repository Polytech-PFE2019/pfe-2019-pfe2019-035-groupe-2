#!/bin/bash

START=101
END=116

POWEROFF=false
RM_DOCKER=false

function rm_docker {
#	scp -q clean-docker.sh pi@192.168.43.$1:
	ssh pi@192.168.43.$1 'IMG_NAME=node-docker-raspberry-zero:armv6 ; CONTAINER=`docker ps -a | grep $IMG_NAME | cut -d " " -f 1` ; if [ \"$CONTAINER\" != \"\" ] ; then	docker rm -f $CONTAINER ; else	echo No $IMG_NAME container started on `hostname`. Nothing to stop. ; fi'
}

function poweroff {
	ssh pi@192.168.43.$1 'sudo poweroff'
}

POSITIONAL=()
while [[ $# -gt 0 ]]
do
	key="$1"
	case $key in
		--poweroff)
			POWEROFF=true
			shift # past argument
			;;
		--rm-docker)
			RM_DOCKER=true
			shift # past argument
			;;
		-h|--help)
			echo "Usage : $0 [OPTION]"
			echo "Send commands to pi targets."
			echo
			echo "Options:"
			echo "  --poweroff     poweroff platform"
			echo "  --rm-docker    stop and delete docker image"
			shift
			;;
		# -e|--extension)
		# EXTENSION="$2"
		# shift # past argument
		# shift # past value
		# ;;
		*)    # unknown option
			POSITIONAL+=("$1") # save it in an array for later
			shift # past argument
			;;
	esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

# scp clean-docker.sh docker@192.168.99.100:
# ssh docker@192.168.99.100 './clean-docker.sh nicolasferry/multiarch-node-red-thingml:latest'

for inst in `seq $START $END`
do
	if [ "$RM_DOCKER" == "true" ] ; then
		rm_docker $inst
	fi
	if [ "$POWEROFF" == "true" ] ; then
		poweroff $inst
	fi
done
