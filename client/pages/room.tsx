import { read } from 'fs';
import type { NextPage } from 'next'
import React from 'react'
import { ReadableStreamDefaultReader } from 'stream/web';
import { Peer } from '../lib/network';
import stream from 'streamsaver'
class Room extends React.Component {
  peer?: Peer;
  chunk_size = 16000;
  offset = 0
  constructor(props: any) {

    super(props)
  }
  componentDidMount() {
    const parms = new URLSearchParams(window.location.search);
    const room_id = parms.get('id')
    const name = parms.get('name')
    if (room_id && name) {
      this.peer = new Peer(room_id, name);
    }
  }
  handleInputFile = async (ele: HTMLInputElement) => {
    if (!ele.files) { return }
    const file = ele.files[0];
    this.peer?.sendFile(file);
    const streamSaver = await import("streamsaver");
    console.log("total size : " + file.size);
    // const reader: ReadableStreamDefaultReader = ((file.stream() as any).getReader())
    const writer = streamSaver.createWriteStream('test.txt').getWriter();
    var size = 0;
    // reader.read().then(({ done, value }) => {
    //   handleReading(done, value);
    //   function handleReading(done: boolean, value: Uint8Array) {
    //     if (done) {
    //       console.log('done');
    //       writer.close()
    //       return;
    //     }
    //     size +=value.length;
    //     writer.write(value).then(() => {
    //       reader.read().then(({ done, value }) => {
    //         handleReading(done, value);
    //       })
    //     })
    //   }
    // })
    console.log(size);

  }
  readFile = (file: File) => {
    file.slice(this.offset, this.offset + this.chunk_size).arrayBuffer().then(file_data => {
      console.log(file_data);
      this.offset += this.chunk_size;
    })
    // if(off)
  }
  render() {
    return (
      <div  >
        <input onChange={(ele) => {
          this.handleInputFile(ele.target)
        }} type={'file'} id='input-file' />
      </div>
    )
  }
}

export default Room
