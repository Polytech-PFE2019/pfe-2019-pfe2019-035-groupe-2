#/bin/bash

#DEMO_PATH="D:\\\\Documents\\\\I3S\\\\ENACT repos\\\\actuation_conflict_manager\\\\demo-pizero"
DEMO_PATH="D:\\\\Dev\\\\contrats\\\\ENACT\\\\actuation_conflict_manager\\\\demos\\\\demo-pizero"
if [ "$1" != "" ]
then
	NUM_RPIZ=$1
else
	NUM_RPIZ=4
fi

#-------------------------------------------------------------------------------------------------
# DON'T EDIT BELLOW

add_comma() {
	INST=$1
	LAST=$2
#	echo -n "$INST $LAST" 1>&2
	if [ "$INST" != "$LAST" ]
	then
#		echo " Add ," 1>&2
		echo -n ", "
#	else
#		echo "" 1>&2
	fi
}

start() {
	echo -n "{
	\"dm\": {
		\"name\": \"demo\",
		\"components\": ["
}

docker_component() {
	INST=$1
	LAST=$2
	echo -n "{
				\"_type\": \"/infra/docker_host\",
				\"name\": \"RPiZero-$INST\",
				\"properties\": [],
				\"version\": \"0.0.1\",
				\"id\": \"`uuidgen`\",
				\"provided_execution_port\": [{
						\"name\": \"offerDocker\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						}
					}
				],
				\"ip\": \"192.168.43.$INST\",
				\"port\": [\"2376\"],
				\"credentials\": {
					\"username\": \"ubuntu\",
					\"password\": \"\",
					\"sshkey\": \"\"
				},
				\"monitoring_agent\": \"none\"
			}, "
	# Don't need to check last because alawys have a node_red_component just after.
#	add_comma $INST $LAST
}

node_red_component() {
	INST=$1
	LAST=$2
	PATH_OR_NRFLOW=$3
	echo -n "{
				\"_type\": \"/internal/node_red\",
				\"name\": \"NodeRED-$INST\",
				\"properties\": [],
				\"version\": \"0.0.1\",
				\"id\": \"`uuidgen`\",
				\"provided_execution_port\": [{
						\"name\": \"offerNodeRED\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						}
					}
				],
				\"docker_resource\": {
					\"name\": \"DockerRaspberryPiZeroGroveBaseHat\",
					\"image\": \"node-docker-raspberry-zero:armv6\",
					\"command\": \"\",
					\"links\": [],
					\"port_bindings\": {
						\"1880\": \"1880\",
						\"1883\": \"1883\"
					},
					\"mounts\": {
						\"src\": \"/sys\",
						\"tgt\": \"/sys\"
					},
					\"devices\": [{
							\"PathOnHost\": \"/dev/mem\",
							\"PathInContainer\": \"/dev/mem\",
							\"CgroupPermissions\": \"rwm\"
						}, {
							\"PathOnHost\": \"/dev/gpiomem\",
							\"PathInContainer\": \"/dev/gpiomem\",
							\"CgroupPermissions\": \"rwm\"
						}, {
							\"PathOnHost\": \"/dev/i2c-1\",
							\"PathInContainer\": \"/dev/i2c-1\",
							\"CgroupPermissions\": \"rwm\"
						}
					]
				},
				\"ssh_resource\": {
					\"name\": \"`uuidgen`\",
					\"startCommand\": \"\",
					\"downloadCommand\": \"\",
					\"installCommand\": \"\",
					\"configureCommand\": \"\",
					\"credentials\": {
						\"username\": \"ubuntu\",
						\"password\": \"\",
						\"sshkey\": \"\"
					}
				},
				\"ansible_resource\": {
					\"name\": \"`uuidgen`\",
					\"playbook_path\": \"\",
					\"playbook_host\": \"\",
					\"credentials\": {
						\"username\": \"ubuntu\",
						\"password\": \"\",
						\"sshkey\": \"\"
					}
				},
				\"required_execution_port\": {
					\"name\": \"demandDocker\",
					\"capabilities\": {
						\"_type\": \"/capability/security_capability\",
						\"name\": \"a_capability\",
						\"control_id\": \"\",
						\"description\": \"\"
					},
					\"needDeployer\": false
				},
				\"provided_communication_port\": [{
						\"name\": \"`uuidgen`\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						},
						\"port_number\": \"1880\"
					}
				],
				\"required_communication_port\": [{
						\"name\": \"`uuidgen`\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						},
						\"port_number\": \"80\",
						\"isMandatory\": false
					}
				],
				\"nr_flow\": [],
				\"path_flow\": \"\",
				\"packages\": []
			}, {
				\"_type\": \"/internal/node_red_flow\",
				\"name\": \"NodeRED-flow-$INST\",
				\"properties\": [],
				\"version\": \"0.0.1\",
				\"id\": \"`uuidgen`\",
				\"provided_execution_port\": [{
						\"name\": \"`uuidgen`\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						}
					}
				],
				\"docker_resource\": {
					\"name\": \"`uuidgen`\",
					\"image\": \"\",
					\"command\": \"\",
					\"links\": [],
					\"port_bindings\": {
						\"1880\": \"1880\"
					},
					\"devices\": {
						\"PathOnHost\": \"\",
						\"PathInContainer\": \"\",
						\"CgroupPermissions\": \"rwm\"
					}
				},
				\"ssh_resource\": {
					\"name\": \"`uuidgen`\",
					\"startCommand\": \"\",
					\"downloadCommand\": \"\",
					\"installCommand\": \"\",
					\"configureCommand\": \"\",
					\"stopCommand\": \"\",
					\"credentials\": {
						\"username\": \"ubuntu\",
						\"password\": \"\",
						\"sshkey\": \"\",
						\"agent\": \"\"
					}
				},
				\"ansible_resource\": {
					\"name\": \"`uuidgen`\",
					\"playbook_path\": \"\",
					\"playbook_host\": \"\",
					\"credentials\": {
						\"username\": \"ubuntu\",
						\"password\": \"\",
						\"sshkey\": \"\",
						\"agent\": \"\"
					}
				},
				\"required_execution_port\": {
					\"name\": \"demandNodeRED\",
					\"capabilities\": {
						\"_type\": \"/capability/security_capability\",
						\"name\": \"a_capability\",
						\"control_id\": \"\",
						\"description\": \"\"
					},
					\"needDeployer\": false
				},
				\"provided_communication_port\": [{
						\"name\": \"`uuidgen`\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						},
						\"port_number\": \"80\"
					}
				],
				\"required_communication_port\": [{
						\"name\": \"`uuidgen`\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						},
						\"port_number\": \"1880\",
						\"isMandatory\": false
					}
				],
				"
	if [ "$PATH_OR_NRFLOW" == "nrflow" ]
	then
		echo -n "
				\"nr_flow\": `node_red_app_pi $INST`,
				\"path_flow\": \"\",
				\"packages\": []
			}"
	else
		echo -n "
				\"nr_flow\": [],
				\"path_flow\": \"$DEMO_PATH\\\\Application_Device.json\",
				\"packages\": []
			}"
	fi
	add_comma $INST $LAST
}

stop_components_start_containment() {
	echo -n "
		],
		\"links\": [],
		\"containments\": ["
}

containment() {
	INST=$1
	LAST=$2
	echo -n "{
				\"name\": \"Docker_on_RPiZero-$INST\",
				\"properties\": [],
				\"src\": \"/RPiZero-$INST/offerDocker\",
				\"target\": \"/NodeRED-$INST/demandDocker\"
			}, {
				\"name\": \"NodeRED-flow-${INST}_on_RPiZero-$INST\",
				\"properties\": [],
				\"src\": \"/NodeRED-$INST/offerNodeRED\",
				\"target\": \"/NodeRED-flow-$INST/demandNodeRED\"
			}"
	add_comma $INST $LAST
}

stop_containments_start_graph() {
	echo -n "
		],
		\"type_registry\": []
	},
	\"graph\": {
		\"elements\": {
			\"nodes\": ["
}

graph_node() {
	INST=$1
	LAST=$2
	MOD=$3
	
	i=$(($INST - 100))
	n=$(($LAST - 100))
	DeltaX=$(( (($i - 1) % ($n / $MOD)) * 100 ))
	DeltaY=$(( (($i - 1) / ($n / $MOD)) * 100 ))
	X=$((285 + $DeltaX))
	Y=$((190 + $DeltaY))

	echo -n "{
					\"data\": {
						\"id\": \"RPiZero-$INST\"
					},
					\"position\": {
						\"x\": $X,
						\"y\": $Y
					},
					\"group\": \"nodes\",
					\"removed\": false,
					\"selected\": false,
					\"selectable\": true,
					\"locked\": false,
					\"grabbable\": true,
					\"classes\": \"container\"
				}, {
					\"data\": {
						\"id\": \"NodeRED-$INST\",
						\"parent\": \"RPiZero-$INST\"
					},
					\"position\": {
						\"x\": $X,
						\"y\": $Y
					},
					\"group\": \"nodes\",
					\"removed\": false,
					\"selected\": false,
					\"selectable\": true,
					\"locked\": false,
					\"grabbable\": true,
					\"classes\": \"node_red\"
				}, {
					\"data\": {
						\"id\": \"NodeRED-flow-$INST\",
						\"parent\": \"NodeRED-$INST\"
					},
					\"position\": {
						\"x\": $X,
						\"y\": $Y
					},
					\"group\": \"nodes\",
					\"removed\": false,
					\"selected\": false,
					\"selectable\": true,
					\"locked\": false,
					\"grabbable\": true,
					\"classes\": \"\"
				}"
	add_comma $INST $LAST
}

stop() {
	echo "
		] 
		},
		\"style\": [{
				\"selector\": \"node\",
				\"style\": {
					\"label\": \"data(id)\",
					\"background-fit\": \"contain\",
					\"background-image-opacity\": \"0.3\",
					\"text-valign\": \"center\",
					\"text-halign\": \"center\",
					\"font-size\": \"4px\",
					\"font-weight\": \"bold\"
				}
			}, {
				\"selector\": \"node.container\",
				\"style\": {
					\"padding\": \"10px\",
					\"text-valign\": \"top\",
					\"text-halign\": \"center\",
					\"background-color\": \"#DDD\",
					\"font-size\": \"8px\",
					\"font-weight\": \"normal\",
					\"shape\": \"rectangle\",
					\"background-image\": \"./img/docker-official.svg\"
				}
			}, {
				\"selector\": \"edge\",
				\"style\": {
					\"curve-style\": \"bezier\",
					\"target-arrow-shape\": \"triangle\"
				}
			}, {
				\"selector\": \"edge.control\",
				\"style\": {
					\"curve-style\": \"bezier\",
					\"target-arrow-shape\": \"circle\"
				}
			}, {
				\"selector\": \":selected\",
				\"style\": {
					\"background-color\": \"black\",
					\"line-color\": \"black\",
					\"target-arrow-color\": \"black\",
					\"source-arrow-color\": \"black\"
				}
			}, {
				\"selector\": \"node.questionable\",
				\"style\": {
					\"border-color\": \"#A33\",
					\"background-color\": \"#B55\",
					\"shape\": \"roundrectangle\"
				}
			}, {
				\"selector\": \"node.node_red\",
				\"style\": {
					\"background-image\": \"./img/node-red-256.png\"
				}
			}, {
				\"selector\": \"node.ansible\",
				\"style\": {
					\"background-image\": \"./img/ansible.png\"
				}
			}, {
				\"selector\": \"node.orion\",
				\"style\": {
					\"background-color\": \"#ADD8E6\",
					\"background-image\": \"./img/fiware_logo.png\"
				}
			}, {
				\"selector\": \"node.thingml\",
				\"style\": {
					\"background-color\": \"#ADD8E6\",
					\"background-image\": \"./img/thingml_short.png\"
				}
			}, {
				\"selector\": \"node.device\",
				\"style\": {
					\"padding\": \"10px\",
					\"text-valign\": \"top\",
					\"text-halign\": \"center\",
					\"background-color\": \"#DDD\",
					\"font-size\": \"8px\",
					\"font-weight\": \"normal\",
					\"shape\": \"rectangle\",
					\"background-image\": \"./img/device.png\"
				}
			}, {
				\"selector\": \"node.vm\",
				\"style\": {
					\"padding\": \"10px\",
					\"text-valign\": \"top\",
					\"text-halign\": \"center\",
					\"background-color\": \"#DDD\",
					\"font-size\": \"8px\",
					\"font-weight\": \"normal\",
					\"shape\": \"rectangle\",
					\"background-image\": \"./img/server_cloud.png\"
				}
			}
		],
		\"zoomingEnabled\": true,
		\"userZoomingEnabled\": true,
		\"zoom\": 3.2470172353340128,
		\"minZoom\": 0.4,
		\"maxZoom\": 6,
		\"panningEnabled\": true,
		\"userPanningEnabled\": true,
		\"pan\": {
			\"x\": -408.0676908559383,
			\"y\": -443.1820530532351
		},
		\"boxSelectionEnabled\": false,
		\"renderer\": {
			\"name\": \"canvas\"
		}
	}
}
"
}

add_application_component() {
	echo -n ", {
				\"_type\": \"/infra/docker_host\",
				\"name\": \"Docker-Application\",
				\"properties\": [],
				\"version\": \"0.0.1\",
				\"id\": \"`uuidgen`\",
				\"provided_execution_port\": [{
						\"name\": \"offerDocker\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						}
					}
				],
				\"ip\": \"192.168.99.100\",
				\"port\": [\"2376\"],
				\"credentials\": {
					\"username\": \"ubuntu\",
					\"password\": \"\",
					\"sshkey\": \"\"
				},
				\"monitoring_agent\": \"none\"
			}, {
				\"_type\": \"/internal/node_red\",
				\"name\": \"NodeRED-Application\",
				\"properties\": [],
				\"version\": \"0.0.1\",
				\"id\": \"`uuidgen`\",
				\"provided_execution_port\": [{
						\"name\": \"offerNodeRED\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						}
				}
				],
				\"docker_resource\": {
					\"name\": \"`uuidgen`\",
					\"image\": \"nicolasferry/multiarch-node-red-thingml:latest\",
					\"command\": \"\",
					\"links\": [],
					\"port_bindings\": {
						\"1880\": \"1880\",
						\"1883\": \"1883\"
					},
					\"devices\": {
						\"PathOnHost\": \"\",
						\"PathInContainer\": \"\",
						\"CgroupPermissions\": \"rwm\"
					}
				},
				\"ssh_resource\": {
					\"name\": \"`uuidgen`\",
					\"startCommand\": \"\",
					\"downloadCommand\": \"\",
					\"installCommand\": \"\",
					\"configureCommand\": \"\",
					\"credentials\": {
						\"username\": \"ubuntu\",
						\"password\": \"\",
						\"sshkey\": \"\"
					}
				},
				\"ansible_resource\": {
					\"name\": \"`uuidgen`\",
					\"playbook_path\": \"\",
					\"playbook_host\": \"\",
					\"credentials\": {
						\"username\": \"ubuntu\",
						\"password\": \"\",
						\"sshkey\": \"\"
					}
				},
				\"required_execution_port\": {
					\"name\": \"demandDocker\",
					\"capabilities\": {
						\"_type\": \"/capability/security_capability\",
						\"name\": \"a_capability\",
						\"control_id\": \"\",
						\"description\": \"\"
					},
					\"needDeployer\": false
				},
				\"provided_communication_port\": [{
						\"name\": \"`uuidgen`\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						},
						\"port_number\": \"1880\"
					}
				],
				\"required_communication_port\": [{
						\"name\": \"`uuidgen`\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						},
						\"port_number\": \"80\",
						\"isMandatory\": false
					}
				],
				\"nr_flow\": [],
				\"path_flow\": \"\",
				\"packages\": []
			}, {
				\"_type\": \"/internal/node_red_flow\",
				\"name\": \"NodeRED-flow-Application\",
				\"properties\": [],
				\"version\": \"0.0.1\",
				\"id\": \"`uuidgen`\",
				\"provided_execution_port\": [{
						\"name\": \"`uuidgen`\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						}
					}
				],
				\"docker_resource\": {
					\"name\": \"`uuidgen`\",
					\"image\": \"\",
					\"command\": \"\",
					\"links\": [],
					\"port_bindings\": {
						\"1880\": \"1880\"
					},
					\"devices\": {
						\"PathOnHost\": \"\",
						\"PathInContainer\": \"\",
						\"CgroupPermissions\": \"rwm\"
					}
				},
				\"ssh_resource\": {
					\"name\": \"`uuidgen`\",
					\"startCommand\": \"\",
					\"downloadCommand\": \"\",
					\"installCommand\": \"\",
					\"configureCommand\": \"\",
					\"stopCommand\": \"\",
					\"credentials\": {
						\"username\": \"ubuntu\",
						\"password\": \"\",
						\"sshkey\": \"\",
						\"agent\": \"\"
					}
				},
				\"ansible_resource\": {
					\"name\": \"`uuidgen`\",
					\"playbook_path\": \"\",
					\"playbook_host\": \"\",
					\"credentials\": {
						\"username\": \"ubuntu\",
						\"password\": \"\",
						\"sshkey\": \"\",
						\"agent\": \"\"
					}
				},
				\"required_execution_port\": {
					\"name\": \"demandNodeRED\",
					\"capabilities\": {
						\"_type\": \"/capability/security_capability\",
						\"name\": \"a_capability\",
						\"control_id\": \"\",
						\"description\": \"\"
					},
					\"needDeployer\": false
				},
				\"provided_communication_port\": [{
						\"name\": \"`uuidgen`\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						},
						\"port_number\": \"80\"
					}
				],
				\"required_communication_port\": [{
						\"name\": \"`uuidgen`\",
						\"capabilities\": {
							\"_type\": \"/capability/security_capability\",
							\"name\": \"a_capability\",
							\"control_id\": \"\",
							\"description\": \"\"
						},
						\"port_number\": \"1880\",
						\"isMandatory\": false
					}
				],
"
	if [ "$PATH_OR_NRFLOW" == "nrflow" ]
	then
		echo -n "
				\"nr_flow\": `cat "$DEMO_PATH\\\\Application_Edge$NUM_RPIZ.json"`,
				\"path_flow\": \"\",
				\"packages\": [\"enact-actuation-conflict-manager-node\", \"node-red-contrib-mqtt-broker\"]
			}"
	else
		echo -n "
				\"nr_flow\": [],
				\"path_flow\": \"$DEMO_PATH\\\\Application_Edge.json\",
				\"packages\": [\"enact-actuation-conflict-manager-node\", \"node-red-contrib-mqtt-broker\"]
			}"
	fi
}

add_application_containment() {
	echo -n ", {
				\"name\": \"NodeRED-Application_on_Docker-Application\",
				\"properties\": [],
				\"src\": \"/Docker-Application/offerDocker\",
				\"target\": \"/NodeRED-Application/demandDocker\"
			}, {
				\"name\": \"NodeRED-flow-Application_on_NodeRED-Application\",
				\"properties\": [],
				\"src\": \"/NodeRED-Application/offerNodeRED\",
				\"target\": \"/NodeRED-flow-Application/demandNodeRED\"
			}"
}

add_application_graph_node() {
	echo -n ", {
					\"data\": {
						\"id\": \"Docker-Application\"
					},
					\"position\": {
						\"x\": 183.66514345708916,
						\"y\": 218.4663312166767
					},
					\"group\": \"nodes\",
					\"removed\": false,
					\"selected\": false,
					\"selectable\": true,
					\"locked\": false,
					\"grabbable\": true,
					\"classes\": \"container\"
				}, {
					\"data\": {
						\"id\": \"NodeRED-Application\",
						\"parent\": \"Docker-Application\"
					},
					\"position\": {
						\"x\": 183.66514345708916,
						\"y\": 218.4663312166767
					},
					\"group\": \"nodes\",
					\"removed\": false,
					\"selected\": false,
					\"selectable\": true,
					\"locked\": false,
					\"grabbable\": true,
					\"classes\": \"node_red\"
				}, {
					\"data\": {
						\"id\": \"NodeRED-flow-Application\",
						\"parent\": \"NodeRED-Application\"
					},
					\"position\": {
						\"x\": 183.66514345708916,
						\"y\": 218.4663312166767
					},
					\"group\": \"nodes\",
					\"removed\": false,
					\"selected\": false,
					\"selectable\": true,
					\"locked\": false,
					\"grabbable\": true,
					\"classes\": \"\"
				}"
}

node_red_app_pi() {
	ID="eac2018f" 		# eac2018f.xx0yy (INST = yy)
	if [ $1 -le 9 ]
	then
		INST=0$1
	else
		INST=$1
	fi
	PARENT=$ID.010$INST		# dd668644.15de98
	MQTT_BROKER=$ID.020$INST   # eac2018f.020101 
	GPIO_OUT=$ID.030$INST	  # eac2018f.030101
	GPIO_IN=$ID.040$INST	   # eac2018f.040101
	RGB_LED=$ID.050$INST	   # eac2018f.050101
	MQTT_BUTTON=$ID.060$INST   # eac2018f.060101
	MQTT_LED=$ID.070$INST	  # eac2018f.070101
	MQTT_RGB=$ID.080$INST	  # eac2018f.080101
	MOSCA_IN=$ID.090$INST	  # eac2018f.090101
	DDISPLAY=$ID.100$INST	  # eac2018f.100101
	MQTT_DDISPLAY=$ID.110$INST # eac2018f.110101
	INJECT=$ID.120$INST       # eac2018f.120101
	TRIGGER=$ID.130$INST     # eac2018f.130101
	DDISPLAY2=$ID.140$INST  # eac2018f.140101
	STORE_BUTTON=$ID.150$INST # d4f9187c.f57268
	STORE_DISPLAY=$ID.160$INST # 6d435a37.b5030c
	STORE_RGB=$ID.170$INST # 55b8eeb6.7e4898
	EMIT_VALUES=$ID.180$INST # 61aefc3.8235984
	COMMENT=$ID.190$INST # 7349e28b.631c24
	RESET_VARS=$ID.200$INST # 8fa43929.30caf
	RGB_LED2=$ID.210$INST # 67e58094.e3d6a8
	GPIO_OUT2=$ID.220$INST # 72771887.06aa4
	SWITCH_OFF=$ID.230$INST # 50d59319.4179dc
	
	echo -n "[{
						\"id\": \"$GPIO_OUT\",
						\"type\": \"rpi-gpio out\",
						\"z\": \"$PARENT\",
						\"name\": \"D 16\",
						\"pin\": \"36\",
						\"set\": true,
						\"level\": \"0\",
						\"freq\": \"\",
						\"out\": \"out\",
						\"x\": 610,
						\"y\": 140,
						\"wires\": []
					}, {
						\"id\": \"$GPIO_IN\",
						\"type\": \"rpi-gpio in\",
						\"z\": \"$PARENT\",
						\"name\": \"D 17\",
						\"pin\": \"11\",
						\"intype\": \"tri\",
						\"debounce\": \"25\",
						\"read\": true,
						\"x\": 90,
						\"y\": 80,
						\"wires\": [[\"$EMIT_VALUES\"]]
					}, {
						\"id\": \"$RGB_LED\",
						\"type\": \"grove-chainable-rgb-led\",
						\"z\": \"$PARENT\",
						\"name\": \"\",
						\"pin\": \"5\",
						\"x\": 560,
						\"y\": 200,
						\"wires\": []
					}, {
						\"id\": \"$MQTT_LED\",
						\"type\": \"mqtt in\",
						\"z\": \"$PARENT\",
						\"name\": \"\",
						\"topic\": \"/grove/button_led\",
						\"qos\": \"2\",
						\"datatype\": \"auto\",
						\"broker\": \"$MQTT_BROKER\",
						\"x\": 130,
						\"y\": 140,
						\"wires\": [[\"$STORE_BUTTON\"]]
					}, {
						\"id\": \"$MQTT_RGB\",
						\"type\": \"mqtt in\",
						\"z\": \"$PARENT\",
						\"name\": \"\",
						\"topic\": \"/grove/rgb_led\",
						\"qos\": \"2\",
						\"datatype\": \"auto\",
						\"broker\": \"$MQTT_BROKER\",
						\"x\": 120,
						\"y\": 200,
						\"wires\": [[\"$STORE_RGB\"]]
					}, {
						\"id\": \"$MQTT_BUTTON\",
						\"type\": \"mqtt out\",
						\"z\": \"$PARENT\",
						\"name\": \"\",
						\"topic\": \"/grove/button\",
						\"qos\": \"\",
						\"retain\": \"\",
						\"broker\": \"$MQTT_BROKER\",
						\"x\": 580,
						\"y\": 80,
						\"wires\": []
					}, {
						\"id\": \"$MOSCA_IN\",
						\"type\": \"mosca in\",
						\"z\": \"$PARENT\",
						\"mqtt_port\": 1883,
						\"mqtt_ws_port\": 8080,
						\"name\": \"\",
						\"username\": \"\",
						\"password\": \"\",
						\"dburl\": \"\",
						\"x\": 110,
						\"y\": 40,
						\"wires\": [[]]
					}, {
						\"id\": \"$DDISPLAY\",
						\"type\": \"grove-4-digit-display\",
						\"z\": \"$PARENT\",
						\"name\": \"\",
						\"pin\": \"22\",
						\"x\": 580,
						\"y\": 260,
						\"wires\": []
					}, {
						\"id\": \"$MQTT_DDISPLAY\",
						\"type\": \"mqtt in\",
						\"z\": \"$PARENT\",
						\"name\": \"\",
						\"topic\": \"/grove/4digit_display\",
						\"qos\": \"2\",
						\"datatype\": \"auto\",
						\"broker\": \"$MQTT_BROKER\",
						\"x\": 130,
						\"y\": 260,
						\"wires\": [[\"$STORE_DISPLAY\"]]
					}, {
						\"id\": \"$INJECT\",
						\"type\": \"inject\",
						\"z\": \"$PARENT\",
						\"name\": \"Startup Inject\",
						\"topic\": \"\",
						\"payload\": \"0\",
						\"payloadType\": \"num\",
						\"repeat\": \"\",
						\"crontab\": \"\",
						\"once\": true,
						\"onceDelay\": \"1\",
						\"x\": 120,
						\"y\": 420,
						\"wires\": [[\"$TRIGGER\", \"$RESET_VARS\", \"$GPIO_OUT2\", \"$SWITCH_OFF\"]]
					}, {
						\"id\": \"$TRIGGER\",
						\"type\": \"trigger\",
						\"z\": \"$PARENT\",
						\"op1\": \" $INST\",
						\"op2\": \"    \",
						\"op1type\": \"str\",
						\"op2type\": \"str\",
						\"duration\": \"5\",
						\"extend\": false,
						\"units\": \"s\",
						\"reset\": \"\",
						\"bytopic\": \"all\",
						\"name\": \"\",
						\"x\": 320,
						\"y\": 500,
						\"wires\": [[\"$DDISPLAY2\"]]
					}, {
						\"id\": \"$DDISPLAY2\",
						\"type\": \"grove-4-digit-display\",
						\"z\": \"$PARENT\",
						\"name\": \"\",
						\"pin\": \"22\",
						\"x\": 500,
						\"y\": 500,
						\"wires\": []
					}, {
						\"id\": \"$STORE_BUTTON\",
						\"type\": \"function\",
						\"z\": \"$PARENT\",
						\"name\": \"Store ButtonLed state\",
						\"func\": \"flow.set('ButtonLed', msg.payload);\n\nreturn msg;\",
						\"outputs\": 1,
						\"noerr\": 0,
						\"x\": 340,
						\"y\": 140,
						\"wires\": [[\"$GPIO_OUT\"]]
					}, {
						\"id\": \"$STORE_DISPLAY\",
						\"type\": \"function\",
						\"z\": \"$PARENT\",
						\"name\": \"Store Display state\",
						\"func\": \"try {\n    val = Number(msg.payload);\n} catch (error) {\n    val = msg.payload;\n}\n\nif (Number.isInteger(val)) {\n    if (val > 9999) {\n        val = 0\n    }\n    if (val === 0) {\n        strval = \\\"    \\\";\n    } else if (val < 10) {\n        strval = \\\"   \\\" + val;\n    } else if (val < 100) {\n        strval = \\\"  \\\" + val;\n    } else if (val < 1000) {\n        strval = \\\" \\\" + val;\n    } else {\n        strval = val;\n    }\n    flow.set('Display', val);\n    msg.payload = strval;\n}\nreturn msg;\",
						\"outputs\": 1,
						\"noerr\": 0,
						\"x\": 330,
						\"y\": 260,
						\"wires\": [[\"$DDISPLAY\"]]
					}, {
						\"id\": \"$STORE_RGB\",
						\"type\": \"function\",
						\"z\": \"$PARENT\",
						\"name\": \"Store RGBLED state\",
						\"func\": \"if (msg.payload === \\\"\\\") return null;\non = -1;\ntry {\n    msg.payload = JSON.parse(msg.payload)\n    on = Number(msg.payload.on)\n    val = Number(msg.payload.val);\n    flow.set('RGBLed', {'on': on, 'val': val});\n} catch (error) {\n    val = msg.payload;\n}\n\nif (on === 0) {\n    msg.payload = \\\"rgb(0, 0, 0)\\\";\n} else if (on === 1) {\n    if (val === -1) {\n        msg.payload = \\\"rgb(255, 255, 255)\\\";\n    } else if (Number.isInteger(val)) {\n        val = val % 360;\n        msg.payload = \\\"hsv(\\\" + val + \\\",100%, 50%)\\\";\n    } else {\n        return null;\n    }\n}\nreturn msg;\",
						\"outputs\": 1,
						\"noerr\": 0,
						\"x\": 340,
						\"y\": 200,
						\"wires\": [[\"$RGB_LED\"]]
					}, {
						\"id\": \"$EMIT_VALUES\",
						\"type\": \"function\",
						\"z\": \"$PARENT\",
						\"name\": \"Emit Sensors/Actuators states\",
						\"func\": \"buttonLed = flow.get('ButtonLed') || 0;\nrgbLed = flow.get('RGBLed') || {'on': 0, 'val': -1};\ndisplay = flow.get('Display') || 0;\nbutton = msg.payload;\n\nmsg.payload = {\n        \\\"button\\\": button,\n        \\\"buttonLed\\\": buttonLed,\n        \\\"rgbLed\\\": rgbLed,\n        \\\"display\\\": display\n}\n\nreturn msg;\",
						\"outputs\": 1,
						\"noerr\": 0,
						\"x\": 330,
						\"y\": 80,
						\"wires\": [[\"$MQTT_BUTTON\"]]
					}, {
						\"id\": \"$COMMENT\",
						\"type\": \"comment\",
						\"z\": \"$PARENT\",
						\"name\": \"Init Phase\",
						\"info\": \"\",
						\"x\": 80,
						\"y\": 360,
						\"wires\": []
					}, {
						\"id\": \"$RESET_VARS\",
						\"type\": \"function\",
						\"z\": \"$PARENT\",
						\"name\": \"Reset flow variables\",
						\"func\": \"flow.set('ButtonLed', 0);\nflow.set(\\\"RGBLed\\\", {'on': 0, 'val': -1});\nflow.set(\\\"Display\\\", 0);\n\nreturn msg;\",
						\"outputs\": 1,
						\"noerr\": 0,
						\"x\": 360,
						\"y\": 380,
						\"wires\": [[]]
					}, {
						\"id\": \"$RGB_LED2\",
						\"type\": \"grove-chainable-rgb-led\",
						\"z\": \"$PARENT\",
						\"name\": \"\",
						\"pin\": \"5\",
						\"x\": 520,
						\"y\": 460,
						\"wires\": []
					}, {
						\"id\": \"$GPIO_OUT2\",
						\"type\": \"rpi-gpio out\",
						\"z\": \"$PARENT\",
						\"name\": \"D 16\",
						\"pin\": \"36\",
						\"set\": true,
						\"level\": \"0\",
						\"freq\": \"\",
						\"out\": \"out\",
						\"x\": 470,
						\"y\": 420,
						\"wires\": []
					}, {
						\"id\": \"$SWITCH_OFF\",
						\"type\": \"function\",
						\"z\": \"$PARENT\",
						\"name\": \"Switch off\",
						\"func\": \"msg.payload = \\\"rgb(0,0,0)\\\"\nreturn msg;\",
						\"outputs\": 1,
						\"noerr\": 0,
						\"x\": 320,
						\"y\": 460,
						\"wires\": [[\"$RGB_LED2\"]]
					}, {
						\"id\": \"$MQTT_BROKER\",
						\"type\": \"mqtt-broker\",
						\"z\": \"eac2018f.010101\",
						\"name\": \"\",
						\"broker\": \"localhost\",
						\"port\": \"1883\",
						\"clientid\": \"\",
						\"usetls\": false,
						\"compatmode\": true,
						\"keepalive\": \"60\",
						\"cleansession\": true,
						\"birthTopic\": \"\",
						\"birthQos\": \"0\",
						\"birthPayload\": \"\",
						\"closeTopic\": \"\",
						\"closeQos\": \"0\",
						\"closePayload\": \"\",
						\"willTopic\": \"\",
						\"willQos\": \"0\",
						\"willPayload\": \"\"
					}
				]
"
}

GenSIS_Model() {
	FIRST=$1
	LAST=$2
	PATH_OR_NRFLOW=$3
	MOD=$4
	ENUM=`seq $FIRST $LAST`
	start
	for inst in $ENUM
	do
		docker_component $inst $LAST
		node_red_component $inst $LAST $PATH_OR_NRFLOW
	done
	add_application_component
	stop_components_start_containment
	for inst in $ENUM
	do
		containment $inst $LAST
	done
	add_application_containment
	stop_containments_start_graph
	for inst in $ENUM
	do
		graph_node $inst $LAST $MOD
	done
	add_application_graph_node
	stop
}

add_app_control() {
	INST=$1
	LAST=$2
	ID="eac2019f" 		# eac2019f.xx0yy (INST = yy)
	PARENT=$ID.000000   # same parent for all the application controling devices
	MQTT_BROKER=$ID.010$INST
	MQTT_BUTTON=$ID.020$INST
	MQTT_BUTTON_LED=$ID.030$INST
	MQTT_RGB_LED=$ID.040$INST
	MQTT_DISPLAY=$ID.050$INST
	FCT_EMIT_BOOL=$ID.060$INST
	FCT_TO_RGB=$ID.070$INST
	FCT_INCR_COUNTER=$ID.080$INST
	FCT_TOOBJ=$ID.090$INST # 70825d5e.d7731c
	i=$(($INST - 101))
	DeltaY=$(($i * 120))
	
	echo -n "{
						\"id\": \"$MQTT_BUTTON\",
						\"type\": \"mqtt in\",
						\"z\": \"$PARENT\",
						\"name\": \"RpiZ $INST Button\",
						\"topic\": \"/grove/button\",
						\"qos\": \"2\",
						\"datatype\": \"auto\",
						\"broker\": \"$MQTT_BROKER\",
						\"x\": 120,
						\"y\": $((60 + $DeltaY)),
						\"wires\": [[\"$FCT_TOOBJ\"]]
					}, {
						\"id\": \"$MQTT_BUTTON_LED\",
						\"type\": \"mqtt out\",
						\"z\": \"$PARENT\",
						\"name\": \"RpiZ $INST Led\",
						\"topic\": \"/grove/button_led\",
						\"qos\": \"\",
						\"retain\": \"\",
						\"broker\": \"$MQTT_BROKER\",
						\"x\": 1280,
						\"y\": $((20 + $DeltaY)),
						\"wires\": []
					}, {
						\"id\": \"$MQTT_RGB_LED\",
						\"type\": \"mqtt out\",
						\"z\": \"$PARENT\",
						\"name\": \"RpiZ $INST RGB\",
						\"topic\": \"/grove/rgb_led\",
						\"qos\": \"\",
						\"retain\": \"\",
						\"broker\": \"$MQTT_BROKER\",
						\"x\": 1280,
						\"y\": $((60 + $DeltaY)),
						\"wires\": []
					}, {
						\"id\": \"$MQTT_DISPLAY\",
						\"type\": \"mqtt out\",
						\"z\": \"$PARENT\",
						\"name\": \"RpiZ $INST Display\",
						\"topic\": \"/grove/4digit_display\",
						\"qos\": \"\",
						\"retain\": \"\",
						\"broker\": \"$MQTT_BROKER\",
						\"x\": 1290,
						\"y\": $((100 + $DeltaY)),
						\"wires\": []
					}, {
						\"id\": \"$FCT_EMIT_BOOL\",
						\"type\": \"function\",
						\"z\": \"$PARENT\",
						\"name\": \"Emit ValBool\",
						\"func\": \"msg.payload = msg.payload.button === 0 ? true : false;\n\nreturn msg;\",
						\"outputs\": 1,
						\"noerr\": 0,
						\"x\": 430,
						\"y\": $((20 + $DeltaY)),
						\"wires\": [[\"$MQTT_BUTTON_LED\"]]
					}, {
						\"id\": \"$FCT_TO_RGB\",
						\"type\": \"function\",
						\"z\": \"$PARENT\",
						\"name\": \"ToRGB\",
						\"func\": \"try {\n    on = parseInt(msg.payload.rgbLed.on);\n    val = parseInt(msg.payload.rgbLed.val);\n    if (msg.payload.button === 0) {\n        on_new = (on + 1) % 2;\n    msg.payload = { 'on': on_new, 'val': val }\n    } else {\n        on_new = on;\n    return null;\n    }\n} catch (error) {\n    val = msg.payload;\n}\n\nreturn msg;\n\",
						\"outputs\": 1,
						\"noerr\": 0,
						\"x\": 440,
						\"y\": $((60 + $DeltaY)),
						\"wires\": [[\"$MQTT_RGB_LED\"]]
					}, {
						\"id\": \"$FCT_INCR_COUNTER\",
						\"type\": \"function\",
						\"z\": \"$PARENT\",
						\"name\": \"Incr counter\",
						\"func\": \"try {\n    val = parseInt(msg.payload.display);\n} catch (error) {\n    val = msg.payload;\n}\n\nif (msg.payload.button === 0) {\n    msg.payload = val + 1;\n    return msg;\n}\",
						\"outputs\": 1,
						\"noerr\": 0,
						\"x\": 430,
						\"y\": $((100 + $DeltaY)),
						\"wires\": [[\"$MQTT_DISPLAY\"]]
					}, {
						\"id\": \"$FCT_TOOBJ\",
						\"type\": \"function\",
						\"z\": \"$PARENT\",
						\"name\": \"toObj\",
						\"func\": \"msg.payload = JSON.parse(msg.payload)\nreturn msg;\",
						\"outputs\": 1,
						\"noerr\": 0,
						\"x\": 270,
						\"y\": $((60 + $DeltaY)),
						\"wires\": [[\"$FCT_EMIT_BOOL\", \"$FCT_TO_RGB\", \"$FCT_INCR_COUNTER\"]]
					}, {
						\"id\": \"$MQTT_BROKER\",
						\"type\": \"mqtt-broker\",
						\"z\": \"$PARENT\",
						\"name\": \"\",
						\"broker\": \"192.168.43.$INST\",
						\"port\": \"1883\",
						\"clientid\": \"\",
						\"usetls\": false,
						\"compatmode\": true,
						\"keepalive\": \"60\",
						\"cleansession\": true,
						\"birthTopic\": \"\",
						\"birthQos\": \"0\",
						\"birthPayload\": \"\",
						\"closeTopic\": \"\",
						\"closeQos\": \"0\",
						\"closePayload\": \"\",
						\"willTopic\": \"\",
						\"willQos\": \"0\",
						\"willPayload\": \"\"
					}"
	add_comma $INST $LAST
}

Application_Edge() {
	FIRST=$1
	LAST=$2
	ENUM=`seq $FIRST $LAST`
	echo -n "["
	for inst in $ENUM
	do
		add_app_control $inst $LAST
	done
	echo "]"
}

MIN=101
MAX=`expr 100 + $NUM_RPIZ`
MOD=`echo "scale=0; sqrt($NUM_RPIZ)" | bc -l`

echo -n "Generate Application_Edge$NUM_RPIZ.json... "
Application_Edge $MIN $MAX > Application_Edge$NUM_RPIZ.json
echo "done."

echo -n "Generate GeneSiS$NUM_RPIZ-nrflow.json... "
GenSIS_Model $MIN $MAX "nrflow" $MOD > GeneSiS$NUM_RPIZ-nrflow.json
#cp GeneSiS$NUM_RPIZ-nrflow.json ../src/acm-app/genesis_models/
echo "done."

echo -n "Generate GeneSiS$NUM_RPIZ-path.json... "
GenSIS_Model $MIN $MAX "path" $MOD > GeneSiS$NUM_RPIZ-path.json
echo "done."

