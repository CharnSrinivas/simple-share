import React, { useEffect, useState } from 'react'
import { User } from '../@types';
import { Events, Peer } from '../lib/network';

export default function Room() {
  var peer: Peer | undefined = undefined;

  const [id, setId] = useState('');
  const [initiator, setInitiator] = useState(false);
  const [loading, setLoading] = useState<'hidden' | 'block'>('block');
  useEffect(() => {
    const parms = new URLSearchParams(window.location.search);

    const name = parms.get('name')
    const id = parms.get('id');
    if (!name) return;
    if (id) {
      peer = new Peer(name, id);
    } else {
      peer = new Peer(name);
    }
    //* Runs on initiator
    Events.on('on-first-user', () => {
      setLoading('hidden')
      if (peer!.server_conn.room_id) {
        setInitiator(true)
        setId(peer!.server_conn.room_id);
      }
    })

    //* Runs on joiner
    Events.on('on-previous-user', (user:{detail:User}) => {
      setLoading('hidden');
      console.log(peer?.server_conn.room_id);
      console.log(user.detail);
      setInitiator(false);
      setId(id!);
    })

  }, [])

  const handleInputFile = async (ele: HTMLInputElement) => {
    if (!ele.files) { return }
    const file = ele.files[0];
    peer?.sendFile(file);
  }

  return (
    <>
      <section className='bg-[#f8f8f8f8]  w-screen h-screen flex items-center'>
        {/* <header className="text-gray-600 body-font flex justify-center bg-transparent ">
          <div className=" container flex px-10 lg:px-0 p-4 items-center justify-center">
            <a className="flex  lg:order-none lg:w-1/5 items-center text-gray-900 lg:items-center lg:justify-center mb-4 md:mb-0">
              <img src="/logo.svg" className="w-1/4 h-1w-1/4 text-white mx-auto" alt="" />
              <span className="ml-3 text-xl space-x-2">GlobeDrop</span>
            </a>
          </div>
        </header> */}
        <div className='container flex items-center justify-center mx-auto  my-auto'>

          <div className=' w-[80%] lg:w-1/2 px-10  py-5 rounded-lg shadow-lg  dark:bg-gray-700 bg-white flex flex-col '>
            <svg
              role="status"
              className={`inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-green-500 self-center ${loading}`}
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
            {initiator &&
              <>
                <span className='flex  items-center gap-2  my-4 '>
                  <h2 className='font-medium text-[#333333] text-xl my-3'>
                    Your share created with id
                  </h2>
                  {/* <h3 className='text-center'>
                    Your share id
                  </h3> */}
                  <h2 className='font-medium text-2xl text-green-500'>
                    {id}
                  </h2>
                </span>
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  Ask your friend to join using your share id.
                </p>
              </>
            }
            {!initiator &&
              <>
                <span className='flex  items-center gap-2  my-4 '>
                  <h2 className='font-medium text-[#333333] text-xl my-3'>
                    Joining to share with id 
                  </h2>
                  {/* <h3 className='text-center'>
                    Your share id
                  </h3> */}
                  <h2 className='font-medium text-2xl text-green-500'>
                    {id}
                  </h2>
                </span>
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  Ask your friend to join using your share id.
                </p>
              </>
            }
            {/* <input onChange={(ele) => {
                handleInputFile(ele.target)
              }} type={'file'} id='input-file' /> */}
          </div>
        </div>
      </section>
    </>
  )
}

