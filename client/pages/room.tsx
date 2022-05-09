import { read } from 'fs';
import type { NextPage } from 'next'
import React from 'react'
import { ReadableStreamDefaultReader } from 'stream/web';
import { Peer } from '../lib/network';
class Room extends React.Component {
  streamsaver = undefined;
  constructor(props: any) {

    super(props)
  }
  componentDidMount() {
    console.log('hit');

    // if (this.did) return;
    // const parms = new URLSearchParams(window.location.search);
    // const room_id = parms.get('id')
    // const name = parms.get('name')
    // if (room_id && name) {
    //   new Peer(room_id, name);
    // }
    // this.did = true;
  }
  handleInputFile = async (ele: HTMLInputElement) => {
    if (!ele.files) { return }
    const file = ele.files[0];

    const streamSaver = await import("streamsaver");
    
    console.log(file);

    const reader: ReadableStreamDefaultReader = ((file.stream() as any).getReader())
    const writer = streamSaver.createWriteStream('test.txt').getWriter();
    reader.read().then(({ done, value }) => {
      handleReading(done, value);
      function handleReading(done: boolean, value: Uint8Array) {
        if (done) {
          console.log('done');
          writer.close()
          return;
        }
        writer.write(value)
        reader.read().then(({ done, value }) => {
          handleReading(done, value);
        })
      }
    })
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
