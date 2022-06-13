import Head from 'next/head'
import Layout from '../components/layout'
import fs from 'fs'
import path from 'path'
import { serialize } from "next-mdx-remote/serialize";
import React from 'react'

export default function About(props) {
    return (
        <Layout>
            <Head>
                <title>About LayerSwap</title>
            </Head>

            <main>
                <div className="flex justify-center">
                    <div className="py-4 px-8 md:px-0 prose md:prose-xl text-blueGray-300">
                        Please close this page
                    </div>
                </div>
            </main>

        </Layout>
    )
}
