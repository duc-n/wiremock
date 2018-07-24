1) Install Java JDK version 7 or 8

2) Install http server 
npm install http-server -g

3) Start the wiremock server :
cd autonomy_wiremock
java -jar wiremock-standalone-2.18.0.jar --port 8888

4) Start the http server :
cd autonomy_wiremock/webapp/resources
http-server -o -p 8080

5) Url : http://127.0.0.1:8080/#/