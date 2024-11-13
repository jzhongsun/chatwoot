
rm -rf ./dist/
rm -rf ./public/packs/
rm -rf ./server/dist/

pnpm build:sdk
pnpm vite -c vite.config.apps.ts build

cd server/
pnpm cp

docker build . -t message

cd ..
