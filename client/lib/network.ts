import { io, Socket } from "socket.io-client";
import { FileInfo, User } from '../@types';
import {SignalingServerUrl} from '../config'
const RtcConfig = {
    "iceServers": [
        {
            urls: "stun:openrelay.metered.ca:80"
        },
        // {
        //     urls: "turn:openrelay.metered.ca:80",
        //     username: "openrelayproject",
        //     credential: "openrelayproject"
        // },
        // {
        //     urls: "turn:openrelay.metered.ca:443",
        //     username: "openrelayproject",
        //     credential: "openrelayproject"
        // },
    ]
}

import SimplePeer from 'simple-peer'
class Events {

    static fire(type: string, detail?: any) {
        window.dispatchEvent(new CustomEvent(type, { detail: detail }));
    }

    static on(type: string, callback: any) {
        return window.addEventListener(type, callback, false);
    }
}

export class ServerConnection {
    socket: Socket;
    room_id: string;
    usr_name: string;
    peer: User | null;

    constructor(room_id: string, usr_name: string) {
        this.peer = null;
        this.room_id = room_id;
        this.usr_name = usr_name;
        this.socket = io(SignalingServerUrl)
        this.socket.on("new-user-joined", this.onNewUserJoin);
        this.socket.on("previous-user", this.onPreviousUser);
        // this.socket.on("ice-candidate", this.onCandidateData);
        this.socket.on("offer", this.handleOffer);
        this.socket.on("answer", this.handleAnswer);
        this.socket.on("first-user", this.onFirstUser);
        this.joinRoom();
    }
    handleAnswer = (answer: any) => {
        Events.fire("on-answer", answer);
    }
    handleOffer = (offer: any) => {
        console.log("on offer", offer);
        Events.fire("on-offer", offer);
    }
    onPreviousUser = (usr: User) => {
        Events.fire("on-previous-user", usr)
    }
    joinRoom() {
        if (!this.room_id && this.usr_name) {
            throw new Error("'room_id' (or) 'name' is null in server connection");
        }
        const payload = { "name": this.usr_name, "room_id": this.room_id };
        this.socket.emit("join-room", payload);
    }
    onFirstUser = () => {
        Events.fire("on-first-user")
    }
    onNewUserJoin = (user: any) => {
        Events.fire("on-new-user-joined", user);
    }

    sendOffer = (target_id: string, offer: any) => {
        this.socket.emit("offer", { target: target_id, offer })
    }
    sendAnswer = (target_id: string, answer: any) => {
        this.socket.emit("answer", { target: target_id, answer })
    }
}

//* Last joined user will be the caller
export class Peer {
    room_id: string;
    usr_name: string;
    server_conn: ServerConnection;
    is_initiator: boolean;
    local_peer?: SimplePeer.Instance;
    remote_peer?: User;
    streamSaver?: any;
    file_handler: FileHandler;
    constructor(room_id: string, usr_name: string) {
        this.file_handler = new FileHandler(this);
        this.room_id = room_id;
        this.usr_name = usr_name;
        this.server_conn = new ServerConnection(room_id, usr_name);
        this.is_initiator = false;
        Events.on("on-first-user", this.handleFirstUser);
        Events.on("on-previous-user", this.handlePreviousUser)
        Events.on("on-new-user-joined", this.handleNewUserJoined);
        Events.on("on-offer", this.handleOffer);
        Events.on("on-answer", this.handleAnswer);
    }
    //? Called in second user
    private handleOffer = (offer: any) => {
        console.log(' offer received');
        this.local_peer = new SimplePeer({ initiator: false, trickle: false, config: RtcConfig });
        this.local_peer.signal(offer.detail);
        this.local_peer.on('signal', answer => {
            console.log('answer');
            console.log(answer);
            this.server_conn.sendAnswer(this.remote_peer!.id, answer);
        })
        this.local_peer.on('connect', this.handleConnection);
    }
    //* triggers on both peers when connection established
    private handleConnection = () => {
        if (!this.local_peer) throw new Error("Local peer is not connected !");
        this.local_peer.send(JSON.stringify({ type: "hello", data: "this is test" }));
        this.local_peer?.on('data', this.handleMessage)
        this.local_peer.on('error', (err) => {
            console.error(err);
        })
    }

    private handleMessage = (data: Uint8Array) => {
        if (data.toString().includes('"type":')) {
            console.log(data.toString());
            let recv_data = JSON.parse(data.toString());
            if (recv_data['type'] === 'file-info') {
                this.file_handler.handleFileInfo(recv_data['data'])
            } else if (recv_data['type'] === 'file-end') {
                this.file_handler.stopReceiving();
            } else if (recv_data['type'] === 'chunk-delivered') {
                this.file_handler.ChunkDelivered(recv_data['data']['chunk_no'])
            }
        } else {
            this.file_handler.onFileChunkReceiving(data);
        }
    }
    sendFile = (file: File) => {
        this.file_handler.sendFile(file);
    }
    sendData = (data: any) => {
        if (!this.local_peer) {
            throw new Error("Peer is not connected to send data");
        }
        this.local_peer.write(data);
    }
    //? Called in second user
    private handlePreviousUser = (usr: { detail: User }) => {
        console.log("on previous user");
        this.remote_peer = usr.detail;
        this.is_initiator = false;
    }
    //* Called in initiator
    private handleAnswer = (answer: any) => {
        console.log('on answer');
        console.log(answer.detail);
        this.local_peer!.signal(answer.detail)
    }
    //* Called in initiator
    private handleNewUserJoined = (usr: { detail: User }) => {
        this.remote_peer = usr.detail;
        this.openConnection();
    }
    //* called in initiator
    private handleFirstUser = () => {
        console.log("first user");
        this.is_initiator = true;
    }
    private openConnection = () => {
        if (this.is_initiator) {
            console.log('new user joined', this.remote_peer);
            this.local_peer = new SimplePeer({
                initiator: this.is_initiator, trickle: false,
                config: RtcConfig
            });
            this.local_peer.on("connect", this.handleConnection);
            this.local_peer.on("signal", offer => {
                console.log('sending offer');
                console.log(offer);
                console.log(this.remote_peer);
                this.server_conn.sendOffer(this.remote_peer!.id, offer);
            });
        }
    }
}

export class FileHandler {
    private streamSaver?: any;
    private file_info?: FileInfo;
    private file_writer?: WritableStreamDefaultWriter;
    private peer: Peer;
    private bytes_received = 0;
    private offset = 0;
    private file?: File;
    private chuck_size = 16 * 1000;//16 KB
    private chunks_received = 0;
    private chunks_sent = 0;
    constructor(peer: Peer) {
        this.peer = peer;
        import('streamsaver').then((d) => {
            this.streamSaver = d;
        })
    }
    get sent_percentage() {
        if (this.file_info) {
            return (this.offset / this.file_info.size) * 100;
        }
        return 0;
    }
    get recv_percentage() {
        if (this.file_info) {
            return (this.bytes_received / this.file_info.size) * 100;
        } return 0;
    }
    onFileChunkReceiving = async (data: Uint8Array) => {
        if (!this.streamSaver) {
            const stream_saver = await import("streamsaver")
            this.streamSaver = stream_saver;
        }
        if (!this.file_info) {
            throw new Error("File info not found");
        }

        if (!this.file_writer) throw new Error("File writer is not defined");
        this.bytes_received += data.length;
        this.file_writer.write(data).then(() => {
            this.chunks_received++;
            console.log('received:  ' + this.recv_percentage);
            this.sendChuckReceived();
        });
    }
    private sendChuckReceived = () => {
        this.peer.sendData(JSON.stringify({ type: "chunk-delivered", data: { chunk_no: this.chunks_received } }));
    }
    stopReceiving = () => {
        console.log("Stopped receiving");
        this.file_writer!.close();
        this.file = undefined;
        // guarantee
        this.bytes_received = 0;
        this.file_info = undefined;
        this.offset = 0;
    }
    handleFileInfo = (info: FileInfo) => {
        console.log("file info received: ");
        console.log(info);
        this.file_writer = (this.streamSaver.createWriteStream(info.name) as WritableStream<any>).getWriter();
        this.file_info = info;
    }
    ChunkDelivered = (chunk_no: number) => {
        console.log('sent: ' + this.chunks_sent + "  delivered: " + chunk_no);
        this.readChunk();
    }
    private readChunk = () => {
        if (this.offset >= this.file_info!.size) {
            this.peer.sendData(JSON.stringify({ type: "file-end", data: this.file_info }))
            this.file = undefined;
            this.bytes_received = 0;
            this.file_info = undefined;
            this.offset = 0;
            return;
        }
        if (!this.file) throw new Error("File not found to read!");
        this.file.slice(this.offset, this.offset + this.chuck_size).arrayBuffer()
            .then(file_chunk => {
                this.onChunk(file_chunk);
            })
    }
    private onChunk = (file_chunk: ArrayBuffer) => {
        this.offset += this.chuck_size;
        this.sendChuck(new Uint8Array(file_chunk));
    }
    sendFile = (file: File) => {
        console.log(file);
        this.file = file;
        this.file_info = { lastModified: file.lastModified, name: file.name, size: file.size, type: file.type };
        this.sendFileInfo();
        this.readChunk()
    }
    sendChuck = (data: Uint8Array) => {
        console.log("sending file:  " + this.sent_percentage + "%");
        this.peer.sendData(data);
        this.chunks_sent++;
    }
    sendFileInfo = () => {
        console.log("sending file info: ");
        console.log(this.file_info);
        this.peer.sendData(JSON.stringify({ type: "file-info", data: this.file_info }));
    }
}