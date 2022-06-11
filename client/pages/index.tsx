import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
export default function Home() {
  const router = useRouter();
  const [create_popup, setCreatePopup] = useState<"hidden" | "flex">('hidden');
  const [join_popup, setJoinPopup] = useState<"hidden" | "flex">('hidden');



  const create = () => {
    let name_ele = document.getElementById('create-name') as HTMLInputElement;
    if (!name_ele) return;
    let name = name_ele.value;
    if (!name) return;
    router.push(`/create/?name=${name}`);
  }
  const join = () => {
    let name_ele = document.getElementById('join-name') as HTMLInputElement;
    let id_ele = document.getElementById('join-id') as HTMLInputElement;
    if (!name_ele || !id_ele) return;
    let name = name_ele.value;
    let id = id_ele.value;
    if (!name) return;
    router.push(`/join/?id=${id}&name=${name}`);
  }
  return (
    <>
      <section id='hero' className='bg-[#F8F8F8] drop-shadow-md h-[80vh] lg:h-fit' >
        <header className="text-gray-600 body-font flex justify-center">
          <div className=" container flex px-10 lg:px-0 p-4 items-center justify-center">
            <p onClick={() => { setCreatePopup('flex') }} className="hover:text-gray-900 text-xl cursor-pointer" title='Create share'>create</p>
            <a className="flex  lg:order-none lg:w-1/5 items-center text-gray-900 lg:items-center lg:justify-center mb-4 md:mb-0">
              <img src="/logo.svg" className="w-1/4 h-1w-1/4 text-white mx-auto" alt="" />
              {/* <span className="ml-3 text-xl space-x-2">GlobeDrop</span> */}
            </a>
            <p onClick={() => { setJoinPopup('flex') }} className="hover:text-gray-900 text-xl cursor-pointer">Join</p>
          </div>
        </header>
        <div className="flex mt-0 lg:mt-12 w-full  lg:w-[75%] p-3 lg:p-6  mx-auto justify-center lg:justify-between ">
          <div className='flex-col mt-12'>
            <div className="md:text-5xl text-4xl mb-4 text-[#333333] text-opacity-90">
              <h2 className='mb-4 space-x-3 '>Now share your files</h2>
              <h2 className='mb-4 space-x-3 '>Securely</h2>
              <span className='mb-3 flex items-baseline gap-2'>
                <h3 className="sm:text-4xl text-3xl mb-4  text-[#333333] text-opacity-90">with</h3>
                <span className='flex flex-col items-center font-medium'>
                  <h1>GlobeDrop</h1>
                  <div className='h-[4px] w-full bg-[#32A95C] rounded-full mt-1'></div>
                </span>
              </span>
            </div>
            <div className="flex gap-5 mt-[6rem]" >
              <button onClick={() => { setCreatePopup('flex') }} title='Create share' className='px-7 bg-[#32A95C] text-white py-2 rounded-full'>Create</button>
              <button onClick={() => { setJoinPopup('flex') }} title='Join share' className='px-8 hover:bg-[#32A95C] hover:text-white border-2  border-[#32A95C] text-[#32A95C] py-2 rounded-full'>Join</button>
            </div>
          </div>
          <div className="hidden lg:block">
            <img src="/hero-right-illustration.svg" alt="" />
          </div>
        </div>
      </section>

      <section id='features'>
        <>
          <div className="py-16 bg-gray-50 overflow-hidden">
            <div className="container m-auto px-6 space-y-8 text-gray-500 md:px-12">
              <div>
                <div className='flex flex-col items-start w-fit'>
                  <span className="text-gray-600 text-3xl font-semibold">
                    Main features
                  </span>
                  <div className='h-[3px] w-1/2 bg-[#32A95C] rounded-full mt-1'></div>
                </div>
                <h2 title='An approach to share data peer-to-peer' className="mt-4 text-2xl text-gray-900 font-bold md:text-4xl">
                  An approach to share data peer-to-peer
                  <br className="lg:block" /> and Securely
                </h2>
              </div>
              <div className="mt-16 grid border divide-x divide-y rounded-xl overflow-hidden sm:grid-cols-2 lg:divide-y-0 lg:grid-cols-3 xl:grid-cols-4">
                <div className="relative group bg-white transition hover:z-[1] hover:shadow-2xl">
                  <div className="relative p-8 space-y-8">
                    <img
                      src="/free.png"
                      className="w-16"
                      width={512}
                      height={512}
                      alt="burger illustration"
                    />
                    <div className="space-y-2 pb-7">
                      <h5 title='Free service' className="text-xl text-gray-800 font-medium transition group-hover:text-green-600">
                        Free service
                      </h5>
                      <p className="text-sm text-gray-600">
                        GlobeDrop offer unlimited free services for life time with no data loss grantee
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative group bg-white transition hover:z-[1] hover:shadow-2xl">
                  <div className="relative p-8 space-y-8">
                    <img
                      src="file.png"
                      className="w-16"
                      width={512}
                      height={512}
                      alt="burger illustration"
                    />
                    <div className="space-y-2 pb-7">
                      <h5 title='Unlimited data sharing' className="text-xl text-gray-800 font-medium transition group-hover:text-green-600">
                        Unlimited data sharing
                      </h5>
                      <p className="text-sm text-gray-600">
                        You can share any number of files or even large file without any charge.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative group bg-white transition hover:z-[1] hover:shadow-2xl">
                  <div className="relative p-8 space-y-8">
                    <img
                      src="/insurance.png"
                      className="w-16"
                      width={512}
                      height={512}
                      alt="burger illustration"
                    />
                    <div className="space-y-2 pb-7">
                      <h5 title='Security is our priority' className="text-xl text-gray-800 font-medium transition group-hover:text-green-600">
                        Security is our priority
                      </h5>
                      <p className="text-sm text-gray-600">
                        You don't need to worry about security of your files. Your file are end-to-end encrypted.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative group bg-white transition hover:z-[1] hover:shadow-2xl">
                  <div className="relative p-8 space-y-8">
                    <img
                      src="/interaction.png"
                      className="w-16"
                      width={512}
                      height={512}
                      alt="burger illustration"
                    />
                    <div className="space-y-2 pb-7">
                      <h5 title='Peer-To-Peer' className="text-xl text-gray-800 font-medium transition group-hover:text-green-600">
                        Peer-To-Peer
                      </h5>
                      <p className="text-sm text-gray-600">
                        GlobeDrop uses peer to peer technology to increase security and reliability.
                        No other parities will participate in your file sharing process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>

      </section>
      {/* CRETE POPUP */}
      <>
        <div
          id="defaultModal"
          tabIndex={1}
          className={`${create_popup} bg-gray-500 bg-opacity-80 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full justify-center items-center flex`}
        >
          <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              {/* Modal header */}
              <div className="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create share
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-toggle="defaultModal"
                  onClick={() => { setCreatePopup('hidden') }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              {/* Modal body */}
              <div className="p-6 space-y-6">
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  Create a room to share files with your friends.
                </p>
                <div className="flex">
                  <span className="text-sm  border-2 rounded-l px-4 py-2 bg-gray-300 whitespace-no-wrap">Name:</span>
                  <input name="name" id='create-name' className=" border-2  rounded-r px-4 py-2 w-full" type="text" placeholder="your name goes here ..." />
                </div>
              </div>
              {/* Modal footer */}
              <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200 dark:border-gray-600">
                <button type='button' onClick={create} title='Create share' className='px-7 bg-[#32A95C] text-white py-2 rounded-full'>Create</button>
                <button type='button' onClick={() => { setCreatePopup('hidden') }} title='Create share' className='px-7 text-gray-500 active:bg-gray-200 py-2 rounded-full'>Close</button>
              </div>
            </div>
          </div>
        </div>
      </>
      {/* JOIN POPUP */}
      <>
        <div
          id="defaultModal"
          tabIndex={1}
          className={`${join_popup} bg-gray-500 bg-opacity-80 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full justify-center items-center flex`}
        >
          <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              {/* Modal header */}
              <div className="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Join share
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-toggle="defaultModal"
                  onClick={() => { setCreatePopup('hidden') }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              {/* Modal body */}
              <div className="p-6 space-y-6">
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  Join to a room share files with your friends.
                </p>
                <div className="flex">
                  <span className="text-sm  border-2 rounded-l px-4 py-2 bg-gray-300 whitespace-no-wrap">Name:</span>
                  <input name="name" id='join-name' className=" border-2  rounded-r px-4 py-2 w-full" type="text" placeholder="your name goes here ..." />
                </div>

                <div className="flex">
                  <span className="text-sm  border-2 rounded-l px-4 py-2 bg-gray-300 whitespace-no-wrap">Share Id:</span>
                  <input name="name" id='join-id' className=" border-2  rounded-r px-4 py-2 w-full" type="number" placeholder="323..." />
                </div>              </div>
              {/* Modal footer */}
              <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200 dark:border-gray-600">
                <button type='button' onClick={join} title='Create share' className='px-7 bg-[#32A95C] text-white py-2 rounded-full'>Join</button>
                <button type='button' onClick={() => { setJoinPopup('hidden') }} title='Create share' className='px-7 text-gray-500 active:bg-gray-200 py-2 rounded-full'>Close</button>
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  )
}