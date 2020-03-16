#/bin/bash

if [ "$1" != "" ]
then
	NUM_RPIZ=$1
else
	NUM_RPIZ=4
fi

if [ "$2" != "" ]
then
	NUM_PP=$2
else
	NUM_PP=2
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

add_physical_process_all() {
	NUM_RPIZ=$1
	echo -n "{
		\"id\": \"56c683e8.00000\",
		\"name\": \"Sync Display\",
		\"x\": 1650,
		\"y\": $((2300 + ($NUM_RPIZ * 100 / 2) ))
	},"
}

add_physical_process_group() {
	PP=$1
	LAST=$2
	echo -n "{
		\"id\": \"56c683e8.0000$PP\",
		\"name\": \"Group $PP\",
		\"x\": 1450,
		\"y\": $((2300 + ($PP - 1) * (1600 / $LAST) ))
	}"
	add_comma $PP $LAST
}

roundup() {
	STR="BEGIN { x+=$1; printf(\"%.0f\", (x == int(x)) ? x : int(x)+1) }"
	echo `awk "$STR"`
}

add_link_all() {
	LINK=$1
	LAST=$2
	NUM_RPIZ=$2
	INST=$(($LINK + 100))
	echo -n "{
		\"from_id\": \"eac2019f.050$INST\",
		\"to_id\": \"56c683e8.00000\"
	}"
	add_comma $LINK $LAST
}

add_link_group() {
	LINK=$1
	LAST=$2
	NUM_RPIZ=$2
	NUM_PP=$3
	INST=$(($LINK + 100))
	VAL=$(echo "scale=1; $LINK / ( $NUM_RPIZ / $NUM_PP )" | bc)
	PP=$(roundup $VAL)
	echo -n "{
		\"from_id\": \"eac2019f.040$INST\",
		\"to_id\": \"56c683e8.0000$PP\"
	}"
	add_comma $LINK $LAST
}

main() {
	# Define Physical processes
	echo -n "{
	\"physical_processes\": ["
	add_physical_process_all $NUM_RPIZ
	for PP in `seq $NUM_PP`
	do
		add_physical_process_group $PP $NUM_PP
	done
	# Define links
	echo -n "
	],
	\"links\": ["
	# Add links to all
	for LINK in `seq $NUM_RPIZ`
	do
		add_link_all $LINK $NUM_RPIZ
	done
	echo -n ", "
	# Add links to groups
	for LINK in `seq $NUM_RPIZ`
	do
		add_link_group $LINK $NUM_RPIZ $NUM_PP
	done
	echo "
	]
}"
}

main > PhysicalProcess-$NUM_RPIZ-$NUM_PP.json
