
import { io, Socket } from "socket.io-client";
import { User } from '../@types';
const RtcConfig = {
    /*  iceServers: [
         {
             urls: 'stun:stun.l.google.com:19302'
         },
         {
             urls: 'stun:global.stun.twilio.com:3478?transport=udp'
         },
         {
             urls: 'turn:numb.viagenie.ca',
             credentials: 'muazkh',
             username: 'webrtc@live.com'
         },
         {
             urls: 'turn:192.158.29.39:3478?transport=udp',
             credentials: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
             username: '28224511:1379330808'
         },
         {
             urls: 'turn:192.158.29.39:3478?transport=tcp',
             credentials: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
             username: '28224511:1379330808'
         },
         {
             urls: 'turn:turn.bistri.com:80',
             credentials: 'homeo',
             username: 'homeo'
         },
         {
             urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
             credentials: 'webrtc',
             username: 'webrtc'
         }
     ] */
    // Using From https://www.metered.ca/tools/openrelay/
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
        {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject"
        }
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
        this.socket = io("http://localhost:3000")
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

    constructor(room_id: string, usr_name: string) {
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
        this.local_peer = new SimplePeer({ initiator: false, trickle: false });
        this.local_peer.signal(offer.detail);
        this.local_peer.on('signal', answer => {
            console.log('answer');
            console.log(answer);
            this.server_conn.sendAnswer(this.remote_peer!.id, answer);
        })
        this.local_peer.on('connect', this.handleConnection);
    }
    //* triggers on both
    private handleConnection = () => {
        if (!this.local_peer) throw new Error("Local peer is not connected !");
        this.local_peer.send("this is test message ");
        this.local_peer?.on('data', this.onMessage)
    }

    private onMessage = (data: Uint8Array) => {
        
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
                config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
            });
            this.local_peer.on("connect", this.handleConnection);
            this.local_peer.on("signal", offer => {
                console.log('sending offer');
                console.log(offer);
                console.log("remote peer");
                console.log(this.remote_peer);
                this.server_conn.sendOffer(this.remote_peer!.id, offer);
            });
        }
    }
}