DOCKERFILE="Dockerfile"
IMAGE_NAME="node-docker-raspberry-zero"

TAG="$IMAGE_NAME:armv6"
TAR="$IMAGE_NAME.tar"

# Build and save the image
printf "\n--- Building $TAG from $DOCKERFILE\n\n"
docker build -t $TAG -f $DOCKERFILE . #1> /dev/null

# printf "\n--- Saving $TAG to '$TAR'\n"
# docker save -o $TAR $TAG
