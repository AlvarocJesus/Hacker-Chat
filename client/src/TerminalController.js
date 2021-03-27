import ComponentBuilder from "./components.js";
import { constantes } from "./constants.js";

export default class TerminalController{
    #usersColors = new Map();

    contructor(){}

    #pickColor(){
        return `#` + ((1<<24) * Math.random() | 0).toString(16) + '-fg'
    }

    #getUserColor(userName){
        if(this.#usersColors.has(userName))
            return this.#usersColors.get(userName)
        const color = this.#pickColor();
        this.#usersColors.set(userName, color);

        return color;
    }

    #onInputReceived(eventEmitter){
        return function(){
            const message = this.getValue()
            eventEmitter.emit(constantes.events.app.MESSAGE_SENT, message);
            this.clearValue()
        }
    }

    #onMessageReceive({ screen, chat }){
        return msg => {
            const { userName, message } = msg;
            const color = this.#getUserColor(userName)
            chat.addIten(`{${color}}{bold}${userName}{/}: ${message}`);
            screen.render();
        }
    }

    #onLogChanged({ screen, activitylog }){
        return msg => {
            const [userName] = msg.split(/\s/);
            const color = this.#getUserColor(useName);
            activitylog.addIten(`{${color}}{bold}${msg.toString}{/}`);
            screen.render();
        }
    }

    #onStatusChanged({ screen, status }){
        return users => {
            const { content } = status.items.shift();
            status.clearItens();
            status.addItem(content);

            users.forEach(userName => {
                const color = this.#getUserColor(userName);

                status.addIten(`{${color}}{bold}${userName}{/}`);
            })
            screen.render();
        }
    }

    #registerEvents(eventEmitter, components){
        eventEmitter.on(constantes.events.app.MESSAGE_RECEIVED, this.#onMessageReceive(components))
        eventEmitter.on(constantes.events.app.ACTIVITYLOG_UPDATE, this.#onLogChanged(components))
        eventEmitter.on(constantes.events.app.STATUS_UPDATED, this.#onStatusChanged(components))
    }

    async initializeTable(eventEmitter){
        const components = new ComponentBuilder()
            .setScreen({ title: 'HackerChat - Alvaro Coelho' })
            .setLayoutComponent()
            .setInputComponent(this.#onInputReceived(eventEmitter))
            .setChatComponent()
            .setActivityLogComponents()
            .setStatusComponents()
            .build()

        this.#registerEvents(eventEmitter, components)

        components.input.focus()
        components.screen.render()
    }
}