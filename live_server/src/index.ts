import { Server } from "socket.io"
import express from "express"
import {createServer} from 'node:http'


const app= express();
const server = createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
    console.log(`${socket.id} conectado`);

    socket.on("nome", (nome) => {
        socket.nome = nome;
    });

    socket.on("mensagem", (data) => {
        socket.broadcast.emit("mensagem", `Nome:${socket.nome}\nMensagem:${data}`);
    });
    socket.on("disconnect", () => {
        console.log(`${socket.id} desconectado`);
    });
});

server.listen(3000, () => {
    console.log("Live rodando na porta 3000");
})