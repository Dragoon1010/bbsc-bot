import { Bot } from "../../classes/Bot";
import WebSocketServer from "../../classes/WebSocketServer";

module.exports = {
    name: 'connectCode',

    execute: (bot: Bot, event: WebSocketServer, params: any) => {
        console.log('code');
        //console.log(params);
    }
} 