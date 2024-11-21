Please read the instructions carefully to setup the server.

Requirements:
- MySQL
- NodeJS
- PM2 (Auto restart server and allow server to operate 24/7)

Instructions:
1. Open command prompt
2. Enter 'cd [Directory]' to navigate to the installed folder.
3. Enter 'npm install' into the command prompt.
4. Wait for all the packages installation.
5. Use 'createTable.sql' to create the MySQL table inside the database.
6. Enter 'npm install pm2 -g' to install PM2
7. Enter 'pm2 start server.js && pm2 save' to start the server and save it to PM2.
8. Now you should able to see the server running by entering 'pm2 list' or check the server log with 'pm2 log server.js'