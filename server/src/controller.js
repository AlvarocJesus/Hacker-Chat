import { constants } from "./constants";
// Parei na aula 3 aos 29:12
export default class Controller{
    #users = new Map()
    #rooms = new Map()

    constructor({ socketServer }){
        this.socketServer = socketServer;
    }

    onNewConnection(socket){
        const { id } = socket;
        console.log('connection stablished with', id);
        const userData = { id, socket };
        this.#updateGlobalUsersData(id, userData);

        socket.on('data', this.#onSocketData(id));
        socket.on('error', this.#onSocketClose(id));
        socket.on('end', this.#onSocketClose(id));
    }

    async joinRoom(socketId, data){
        const userData = data;
        console.log(`${userData.userName} joineed! ${[socketId]}` );

        const { roomId } = userData;
        const user = this.#updateGlobalUserData(socketId, userData);
        const users = this.#joinUserOnRoom(roomId, user);

        const currentUsers = Array.from(users.values())
            .map(({id, userName}) => ({ userName, id }))
        

        // atualiza o ususario que conectou sobre, quais usuarios que ja estavam na sala
        this.socketServer.sendMessage(user.socket, constants.event.UPDATE_USERS);

        // Avisa a rede inteira
        this.broadCast({
            socketId,
            roomId,
            message: { id: socketId, userName: userData.userName },
            event: constants.event.NEW_USER_CONNECTED,
        })
    }

    broadCast({ roomId, event, mensage, includeCurrentSocket = false }){
        const usersOnRooms = this.#rooms.get(roomId);

        for(const [key, user] of usersOnRooms){
            if(includeCurrentSocket && key === socketId) continue;

            this.socketServer.sendMessage(user.socket, event, mensage);
        }

    }

    message(socketId, data){
        const {userName, roomId} = this.#users.get(socketId);

        this.broadCast({
            roomId,
            socketId,
            event: constants.event.MESSAGE,
            mensage: { userName, message: data },
            includeCurrentSocket: true,
        })
    }

    #joinUserOnRoom(roomId, user){
        const usersOnRooms = this.#rooms.get(roomId) ?? new Map();
        usersOnRooms.set(user.id, user)
        this.#rooms.set(roomId, usersOnRooms);

        return usersOnRooms;
    }

    #onSocketData(id){
        return data =>{
            try{
                const { event, message } = JSON.parse(data);
                this[event](id, message)
            } catch{
                console.log(`wrong event format`, data.toString());
            }
            
        }
    }
    // #onSocketError(id){
    //     return data =>{
    //         console.log('data', data.toString())
    //     }
    // }
    #logoutUser(id, roomId){
        this.#users.delete(id);
        const userOnRoom = this.#rooms.get(roomId);
        userOnRoom.delete(id);

        this.#rooms.set(roomId, userOnRoom)
    }

    #onSocketClose(id){
        return _ =>{
            const { userName, roomId } = this.#users.get(id);
            console.log(userName, 'disconencted', id);
            this.#logoutUser(id, roomId);

            this.broadCast({
                roomId,
                message: { id, userName },
                socketId: id,
                event: constants.event.DISCONNECT_USER,
            })
        }
    }

    #updateGlobalUserData(socketId, userData){
        const users = this.#users;
        const user = users.get(socketId) ?? {}

        const updateUserData = {
            ...user,
            ...userData
        }

        users.set(socketId, updateUserData)

        return users.get(socketId);

    }
}