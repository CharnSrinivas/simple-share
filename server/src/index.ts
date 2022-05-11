import express from 'express'
import http from 'http'
import socket from 'socket.io'
import cors from 'cors'
const port = 3000;

try {
    const app = express();
    
    app.get("/hi", (req, res) => {
        res.send("<h1>Hello</h1>")
    })
    app.use(cors({ origin: "*" }))
    const server = http.createServer(app);
    const io = new socket.Server(server, { cors: { origin: "*" } });
    const rooms: { [key: string]: { name: string, id: string }[] } = {};

    io.on("connection", (socket) => {
        console.log("Connection : " + socket.id);
        socket.on("join-room", (payload) => {
            console.log(payload);
            const room_id = payload['room_id'] as string;

            if (rooms[room_id]) {
                if (rooms[room_id].length > 1) {
                    console.log("maax is 2 members"); return;
                };
                rooms[room_id].push({ name: payload['name'], id: socket.id });
            } else {
                rooms[room_id] = [{ name: payload['name'], id: socket.id }];
            }
            const previous_user = rooms[room_id].find((user, index) => user.id !== socket.id);
            console.log(previous_user);

            if (previous_user) {
                socket.to(previous_user.id).emit("new-user-joined", { name: payload['name'], id: socket.id });
                socket.emit("previous-user", previous_user);
            } else {
                socket.emit("first-user");
            }
        })
        socket.on("offer", payload => {
            console.log("offer");
            io.to(payload.target).emit("offer", payload.offer)
        })
        socket.on("answer", payload => {
            console.log('answer');
            io.to(payload.target).emit("answer", payload.answer);
        })
        socket.on("ice-candidate", payload => {
            console.log(" Ice candidate ");
            io.to(payload.target).emit("ice-candidate", payload.candidate);
        })
    });
    
} catch (error) {
    console.log(error);
}
