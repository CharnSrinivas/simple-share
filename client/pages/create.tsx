import React, { useEffect, useState } from 'react'
import { Events, Peer } from '../lib/network';
import { FileInfo } from '../@types'

//* USING GLOBAL VARIABLES TO AVOID ODD BEHAVIOR OF REACT HOOKS

var peer: Peer | undefined = undefined;
var send_files: { file_info: FileInfo, sent_percentage: number }[] = []
var recv_files: { file_info: FileInfo, recv_percentage: number }[] = []

export default function Create() {
    const [id, setId] = useState('');
    const [connecting, setIsConnecting] = useState<'hidden' | 'block'>('block');
    const [connected, setIsConnected] = useState(false);
    const [_, setValue] = useState(0);

    useEffect(() => {
        const parms = new URLSearchParams(window.location.search);
        const name = parms.get('name')
        if (!name) return;
        peer = new Peer(name);
        //* Runs on initiator
        Events.on('on-first-user', () => {
            setIsConnecting('hidden')
            if (peer!.server_conn.room_id) {
                setId(peer!.server_conn.room_id);
            }
        })

        const handleOnChunkDelivered = (chunk_no: number) => {
            // console.log(send_files);
            if (!peer || send_files.length <= 0) return;
            send_files[0].sent_percentage = peer.file_handlers.sent_percentage;
            // console.log(peer.file_handlers.sent_percentage);
            setValue(Math.random())
        }

        const handleOnNewFile = (file_info: FileInfo) => {
            recv_files = [{ file_info: file_info, recv_percentage: 0 }].concat(recv_files);
            setValue(Math.random())
            // console.log(recv_files);

        }
        const handleOnFileChunkReceived = (file_info: FileInfo) => {
            // console.log(recv_files);
            if (!peer || recv_files.length <= 0) return;
            recv_files[0].recv_percentage = peer.file_handlers.recv_percentage;
            // console.log(peer.file_handlers.recv_percentage);
            setValue(Math.random())
        }
        peer.file_handlers.onChunkDelivered = handleOnChunkDelivered;
        peer.file_handlers.onNewFile = handleOnNewFile;
        peer.file_handlers.onChunkReceived = handleOnFileChunkReceived;
        
        Events.on('on-connection-established', () => {
            // console.log('Creator: connection-established');
            setIsConnected(true);
        })
    }, []);

    const handleInputFile = async (ele: HTMLInputElement) => {
        if (!ele.files) { return; }
        const file = ele.files[0];
        if (!file) return;
        peer?.sendFile(file);
        send_files = [{ file_info: { lastModified: file.lastModified, name: file.name, size: file.size, type: file.type }, sent_percentage: 0 }].concat(send_files);
        // console.log(send_files);
        setValue(Math.random());
    }

    return (
        <>
            <section className='bg-[#f8f8f8f8]  w-screen h-screen flex items-center'>
                {
                    !connected &&
                    <div className='container flex items-center justify-center mx-auto  my-auto'>
                        <div className=' w-[80%] lg:w-1/2 px-10  py-5 rounded-lg shadow-lg  dark:bg-gray-700 bg-white flex flex-col '>
                            <svg
                                role="status"
                                className={`inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-green-500 self-center ${connecting}`}
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                />
                            </svg>
                            {connecting === 'hidden' &&
                                <>
                                    <span className='flex  items-center gap-2  my-4 '>
                                        <h2 className='font-medium text-[#333333] text-xl my-3'>
                                            Your share created with id
                                        </h2>
                                        <h2 className='font-medium text-2xl text-green-500'>
                                            {id}
                                        </h2>
                                    </span>
                                    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                        Ask your friend to join using your share id.
                                    </p>
                                </>
                            }
                        </div>
                    </div>
                }
                {
                    connected &&
                    <>
                        <div className=' w-[90%] lg:w-[75%] px-3 lg:px-10  py-5 rounded-lg shadow-lg mx-auto flex flex-col bg-white'>
                            <div className='flex  flex-wrap self-center w-full lg:w-[80%] justify-between gap-1'>
                                <span className='flex self-start items-baseline gap-2'>
                                    <h3 className='font-medium text-[#333333]'> Connected with</h3>
                                    <h2 className='font-medium text-xl text-green-600'>{peer?.remote_peer?.name}</h2>
                                </span>
                                <span className='flex self-start items-baseline gap-2'>
                                    <h3 className='font-medium text-[#333333]'> Id:</h3>
                                    <h2 className='font-medium text-xl text-green-600'>
                                        {id}
                                    </h2>
                                </span>
                            </div>
                            <label className="self-center my-6 px-5 py-3 bg-[#32A95C] text-blue rounded-full hover:shadow-lg cursor-pointer text-white w-fit">
                                <span className="mt-2 text-base leading-normal">Select a file</span>
                                <input id='file-input' type="file" onChange={(e) => { handleInputFile(e.target) }} className="hidden" />
                            </label>
                            <h3 className='font-medium my-2'>Sending files</h3>
                            {send_files.length > 0 &&
                                <div className='w-full px-5 border-2 border-gray-300 rounded-lg py-5  lg:shadow-xl'>
                                    {send_files.map((file, index) => {
                                        return (<>
                                            <hr />
                                            <div key={index} className='flex flex-col w-full'>
                                                <h2 className='text-gray-700 my-2'>{file.file_info.name}</h2>
                                                <div className='flex flex-col gap-1'>
                                                    <h4 className='self-end'>{file.sent_percentage}%</h4>
                                                    <div className="w-full bg-gray-200 h-1">
                                                        <div className="bg-blue-600 h-1" style={{ width: `${file.sent_percentage}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                        </>)
                                    })}
                                </div>
                            }
                            <h3 className='font-medium my-2'>Receiving files</h3>
                            {
                                recv_files.length > 0 &&
                                <div className='w-full px-5 border-2 border-gray-300 rounded-lg py-5  lg:shadow-xl'>
                                    {recv_files.map((file, index) => {
                                        return (
                                            <>
                                                <hr />
                                                <div key={index} className='flex flex-col w-full'>
                                                    <h2 className='text-gray-700 my-2'>{file.file_info.name}</h2>
                                                    <div className='flex flex-col gap-1'>
                                                        <h4 className='self-end'>{file.recv_percentage}%</h4>
                                                        <div className="w-full bg-gray-200 h-1">
                                                            <div className="bg-blue-600 h-1" style={{ width: `${file.recv_percentage}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <hr />
                                            </>)
                                    })}
                                </div>
                            }
                        </div>
                    </>
                }
            </section>
        </>
    )
}

