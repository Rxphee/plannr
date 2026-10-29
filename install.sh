#!/usr/bin/env bash
set -e

. ~/.nvm/nvm.sh

# jump into project dir
cd $(dirname $0)

if [[ ! -f .env.local ]]
then
    echo "# override for local env" > .env.local
fi

if [[ ! -f .env.secrets ]]
then
    echo "# secrets for local env" > .env.secrets
fi

# use correct npm and install dependencies
nvm install
nvm use

echo -e "\033[34m\nInstalling dependencies for root package\033[0m"
npm install

echo -e "\033[34m\nSetup project files\033[0m"
npm run setup-project-files

echo -e "\033[34m\nInstalling dependencies for api\033[0m"
npm --prefix api install
echo -e "\033[34m\nInstalling dependencies for web\033[0m"
npm --prefix web install
