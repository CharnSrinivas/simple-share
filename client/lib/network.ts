import { io, Socket } from "socket.io-client";
import { FileInfo, User } from '../@types';
import { SignalingServerUrl } from '../config'
const RtcConfig = {
    "iceServers": [
        {
            urls: "stun:openrelay.metered.ca:80"
        },
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject"
        },
        {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject"
        },
    ]
}

import SimplePeer from 'simple-peer'
export class Events {

    static fire(type: string, detail?: any) {
        window.dispatchEvent(new CustomEvent(type, { detail: detail }));
    }

    static on(type: string, callback: any) {
        return window.addEventListener(type, callback, false);
    }
}

export class ServerConnection {
    socket: Socket;
    room_id?: string;
    usr_name: string;
    remote_peer: User | null;

    constructor(usr_name: string, room_id?: string) {
        this.remote_peer = null;
        this.usr_name = usr_name;
        this.socket = io(SignalingServerUrl)
        this.socket.on("new-user-joined", this.onNewUserJoin);
        this.socket.on("previous-user", this.onPreviousUser);
        // this.socket.on("ice-candidate", this.onCandidateData);
        this.socket.on("offer", this.handleOffer);
        this.socket.on("connection-established", this.handleOnConnectionEstablished)
        this.socket.on("answer", this.handleAnswer);
        this.socket.on("first-user", this.onFirstUser);
        this.socket.emit('room-id');
        this.room_id = room_id;
        if (!room_id) {
            this.socket.on('room-id', (_room_id: string) => {
                this.room_id = _room_id;
                console.log(_room_id);
                this.joinRoom();
            })
        } else {
            this.joinRoom()
        }
    }
    handleOnConnectionEstablished = () => {
        Events.fire('on-connection-established');
    }
    handleAnswer = (answer: any) => {
        Events.fire("on-answer", answer);
    }
    handleOffer = (offer: any) => {
        console.log("on offer", offer);
        Events.fire("on-offer", offer);
    }
    onPreviousUser = (usr: User) => {
        this.remote_peer = usr;
        Events.fire("on-previous-user", usr)
    }
    joinRoom() {
        if (!this.room_id && this.usr_name) {
            throw new Error("'room_id' (or) 'name' is null in server connection");
        }
        const payload = { "name": this.usr_name, "room_id": this.room_id };
        this.socket.emit("join-room", payload);
        // Events.fire('on-room-join')
    }
    onFirstUser = () => {
        Events.fire("on-first-user")
    }
    onNewUserJoin = (user: any) => {
        this.remote_peer = user
        Events.fire("on-new-user-joined", user);
    }
    sendOffer = (target_id: string, offer: any) => {
        this.socket.emit("offer", { target: target_id, offer })
    }
    sendAnswer = (target_id: string, answer: any) => {
        this.socket.emit("answer", { target: target_id, answer })
    }
    sendConnectionSuccess = () => {
        this.socket.emit("connection-established", { target: this.remote_peer?.id })
    }
}

//* Last joined user will be the caller
export class Peer {
    usr_name: string;
    server_conn: ServerConnection;
    is_initiator: boolean;
    local_peer?: SimplePeer.Instance;
    remote_peer?: User;
    streamSaver?: any;
    file_handlers: FileHandler;
    constructor(usr_name: string, room_id?: string) {
        this.file_handlers = new FileHandler(this);
        this.usr_name = usr_name;
        this.server_conn = new ServerConnection(usr_name, room_id);
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
        this.server_conn.sendConnectionSuccess();
        this.local_peer.on('data', this.handleMessage)
        this.local_peer.on('error', (err) => {
            console.error(err);
        })
    }
    private handleMessage = (data: Uint8Array) => {
        const str_data = data.toString();
        if (str_data.includes('"type":')) {
            let recv_data = JSON.parse(str_data);
            if (recv_data['type'] === 'file-info') {
                console.log(recv_data);

                this.file_handlers.handleFileInfo(recv_data['data'])
            } else if (recv_data['type'] === 'file-end') {
                this.file_handlers.stopReceiving();
            } else if (recv_data['type'] === 'chunk-delivered') {
                this.file_handlers.ChunkDelivered(recv_data['data']['chunk_no'])
            }
        } else {
            this.file_handlers.onFileChunkReceiving(data);
        }
    }
    sendFile = (file: File) => {
        this.file_handlers.sendFile(file);
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
    //* Sending offer 
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

    onChunkDelivered?: (chunk_no: number) => any;
    onFileEnd?: () => void;
    onNewFile?: (file_info: FileInfo) => void;
    onChunkReceived?: (file_info: FileInfo) => void;
    constructor(peer: Peer) {
        this.peer = peer;
        import('streamsaver').then((d) => {
            this.streamSaver = d;
        })
    }
    get sent_percentage() {
        if (this.file_info) {
            var sent_percentage = Math.floor((this.offset / this.file_info.size) * 100)
            return sent_percentage > 100 ? 100 : sent_percentage;
        }
        return 0;
    }
    get recv_percentage() {
        if (this.file_info) {
            const recv_percentage = Math.floor((this.bytes_received / this.file_info.size) * 100);
            return recv_percentage > 100 ? 100 : recv_percentage;
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
            if (this.onChunkReceived) this.onChunkReceived(this.file_info!);
            console.log('received:  ' + this.recv_percentage);
            this.sendChuckReceived();
        });
    }
    private sendChuckReceived = () => {
        this.peer.sendData(JSON.stringify({ type: "chunk-delivered", data: { chunk_no: this.chunks_received } }));
    }
    stopReceiving = () => {
        Events.fire('on-file-end', this.file_info);
        if (this.onFileEnd) this.onFileEnd();
        this.file_writer!.close();
        this.file = undefined;
        this.bytes_received = 0;
        this.file_info = undefined;
        this.offset = 0;
    }
    handleFileInfo = (info: FileInfo) => {
        console.log(info);
        if (this.onNewFile) this.onNewFile(info);
        Events.fire('on-new-file-info', info);
        this.file_writer = (this.streamSaver.createWriteStream(info.name) as WritableStream<any>).getWriter();
        this.file_info = info;
    }
    ChunkDelivered = (chunk_no: number) => {
        console.log('sent: ' + this.chunks_sent + "  delivered: " + chunk_no);
        Events.fire('on-chunk-delivered', { file_info: this.file_info, chunk_no })
        if (this.onChunkDelivered) { this.onChunkDelivered(chunk_no); }
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