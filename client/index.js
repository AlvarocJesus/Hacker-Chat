#!/usr/bin/env node


/*
    chmod +x index.js
*/

/*
npm i -g @alvarocjesus/hacker-chat-client

npm unlink -g @alvarocjesus/hacker-chat-client
hacker-chat/
    --username alvaro \
    --room sala01 \

./index.js \
    --username alvaro \
    --room sala01 \

node index.js
    --username alvaro \
    --room sala01 \
    --hostUri localhost \
*/

import EventEmitter from 'events';
import Events from 'events';
import CliConfig from './src/cliConfig.js';
import EventManager from './src/eventManager.js';
import SocketClient from './src/socket.js';
import TerminalController from "./src/TerminalController.js";

const [nodePath, filePath, ...comands] = process.argv;
const config = CliConfig.parseArguments(comands);

const componentEmitter = new Events();
const socketClient = new SocketClient(config);
await socketClient.initialize();
const EventManager = new EventManager({ componentEmitter, socketClient });
const events = EventManager.getEvents();
socketClient.attachEvents(events);
const data = {
    roomId: config.room,
    userName: config.username
}
EventEmitter.joinRoomAndWaitMessage(data);


const controller = new TerminalController();
await controller.initializeTable(componentEmitter);


// tirar de producao
/**cd client
 *  npm unlink -g @alvarocjesus/hacker-chat-client
 *  npm unpublish --force 
 * deletar servidor
 * heroku apps:delete
 * deletar pasta git
 * rm -rf .git
*/