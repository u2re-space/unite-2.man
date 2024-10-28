::call npm run build
mkdir .\webext\
call openssl genrsa -out ./webext/webapp.pem 2048
call crx3 ./webapp.runtime -p ./webext/webapp.pem -o ./webext/webapp.crx
call web-ext build --source-dir=./webapp.runtime --artifacts-dir=./webext/ --overwrite-dest=true -n webapp.xpi
pause
