import type { NextPage } from 'next'
import React from 'react'
import { Peer } from '../lib/network';
class Room extends React.Component {

  did = false
  constructor(props: any) {

    super(props)
  }
  componentDidMount() {
    if (this.did) return;
    const parms = new URLSearchParams(window.location.search);
    const room_id = parms.get('id')
    const name = parms.get('name')
    if (room_id && name) {
      new Peer(room_id, name);
    }
    // if (!name) return;
    // socket.emit("join-room", { name, room_id: id })

    /*     const init = window.location.hash === "#init";
        const peer1 = new Peer({
          initiator: init,
          trickle: false,
        })
        const peer2 = new Peer({ trickle: false })
        peer2.on("signal", answer => {
          console.log("peer 2 signal");
          console.log(answer);
          peer1.signal(answer);
        })
        peer1.on("signal", offer => {
          console.log("peer1 signal");
          console.log(offer);
          //* sending offer to peer-2
          peer2.signal(offer)
        })
        peer1.on("connect", () => {
          console.log("peer1 connection");
        })
        peer2.on("connect", () => {
          console.log("Peer2 connection");
        }) */
    this.did = true;
  }

  render() {
    return (
      <div  >

      </div>
    )
  }
}

export default Room
