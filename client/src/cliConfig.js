const PRODUCTION_URL = 'https://hacker-chat-acj.herokuapp.com';

export default class CliConfig{
    constructor({usename, hostUri = PRODUCTION_URL, room}){
        this.username = username;
        this.room = room;
        const {hostname, port, protocol} = new URL(hostUri);

        this.host = hostname;
        this.port = port;
        this.protocol = protocol.replace(/\W/, '');
    }
    static parseArguments(comands){
        const cmd = new Map();
        for(const key in comands){

            const index = parseInt(key);
            const comand = comands[key];

            const comandPrefix = '--'
            if(!comand.include(comandPrefix)) continue;

            cmd.set(
                comand.replace(comandPrefix, ''),
                comands[index + 1],
            )
        }
        return new CliConfig(Object.fromEntries(cmd));
    }
}

// Parei em 20:48 da aula 02