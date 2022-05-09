import type { NextPage } from 'next'
import Link from 'next/link'
import { useEffect } from 'react'

import { v4 as uuid } from 'uuid'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {


  return (
    <div className={styles.container}>
        <Link href={`/room/?id=${uuid()}`} >create room</Link>
    </div>
  )
}

export default Home
