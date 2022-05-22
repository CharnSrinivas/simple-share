import express from 'express'
import http from 'http'
import socket from 'socket.io'
import cors from 'cors'
const port = process.env.PORT || 3000;

try {
    const app = express();

    app.get("/", (req, res) => {
        res.send("<h1>Hello</h1>")
    })
    app.use(cors({ origin: "*" }))
    const server = http.createServer(app);
    const io = new socket.Server(server, { cors: { origin: "*" } });
    const rooms: { [key: string]: { name: string, id: string }[] } = {};

    io.on("connection", (socket) => {
        console.log("Connection : " + socket.id);
        socket.on("join-room", (payload) => {
            const room_id = payload['room_id'] as string;
            if (rooms[room_id]) {
                if (rooms[room_id].length > 1) {
                    console.log("max is 2 members"); return;
                };
                rooms[room_id].push({ name: payload['name'], id: socket.id });
            } else {
                console.log("new room id : " + room_id);
                rooms[room_id] = [{ name: payload['name'], id: socket.id }];
            }
            const previous_user = rooms[room_id].find((user, index) => user.id !== socket.id);
            if (previous_user) {
                socket.to(previous_user.id).emit("new-user-joined", { name: payload['name'], id: socket.id });
                socket.emit("previous-user", previous_user);
            } else {
                socket.emit("first-user");
            }
        })
        socket.on('room-id', () => {
            var room_id = Math.floor(Math.random() * 10000);
            while (rooms[room_id]) {
                room_id = Math.floor(Math.random() * 10000);
            }
            socket.emit('room-id', room_id)
        })
        socket.on("offer", payload => {
            io.to(payload.target).emit("offer", payload.offer)
        })
        socket.on('connection-established', (payload: any) => {
            io.to(payload.target).emit('connection-established', socket.id)
        })
        socket.on("answer", payload => {
            console.log('answer');
            io.to(payload.target).emit("answer", payload.answer);
        })
        socket.on("ice-candidate", payload => {
            console.log(" Ice candidate ");
            io.to(payload.target).emit("ice-candidate", payload.candidate);
        })
        socket.on('disconnect', () => {
            console.log("Disconnected =>  " + socket.id);
            delete rooms[socket.id];
            // delete rooms[socket.id];
        })
    });
    server.listen(port, () => {
        console.log(`Signaling Server running on port: ${port}`);
    });
} catch (error) {
    console.log(error);
}
