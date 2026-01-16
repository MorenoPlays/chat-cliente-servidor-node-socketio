import {io} from "socket.io-client"
import readline from "readline";

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "Eu> "
});
let nomeUsuario = "";

socket.on("connect", () => {
    console.log("estou conectado comece por digitar o seu nome\n");
    rl.prompt();
    rl.on("line", (line: string) => {
        if (nomeUsuario === "") {
            nomeUsuario = line.trim();
            socket.emit("nome", nomeUsuario);
            console.log(`Bem vindo, ${nomeUsuario}! Agora você pode começar a enviar mensagens.`);
            rl.prompt();
            return;
        }
    socket.emit("mensagem", line.trim());
    rl.prompt();
    }).on("close", () => {
        console.log("Encerrando cliente");
        process.exit(0);
    });

    socket.on("mensagem", (data) => {
        console.log('\n', data);
        rl.prompt();
    });
    socket.on("disconnect", () => {
        console.log("desconectado do servidor");
    });
});
