'use client'
import { useRef } from "react"
import YouTube from "react-youtube"

export default function Page({ params }: { params: { slug: string } }) {
  const videoElement = useRef(null)
  const onReady = (event: any)=>{
    // let videoNode = event.target.querySelector("video")
     console.log("element:", videoElement.current)
   }
  let video_url =  params.slug
    return  <>
      
    <main className="flex min-h-screen flex-col items-center p-5 gap-4">
             <div className="w-full flex items-center justify-center">
             <nav className="max-lg:hidden flex gap-7 bg-purple-500 dark:bg-slate-600 
              px-10 py-3 shadow-xl rounded-3xl text-xl font-bold
              ">
                <a className="hover:text-slate-700 p-2 bg-slate-300 rounded-3xl" href="#">Watch the  video</a>
                <a className="hover:text-slate-300 p-2" href="#">Summarize the video</a>
                <a className="hover:text-slate-300 p-2" href="#">Extract code in the video</a>
                <a className="hover:text-slate-300 p-2" href="#">Ask question</a>
              </nav>
              <nav className="lg:hidden flex gap-6  bg-purple-500 dark:bg-slate-600 
              px-10 py-3 shadow-xl rounded-3xl text-lg font-bold">
                <a className="hover:text-slate-700 p-2 bg-slate-300 rounded-3xl" href="#">Watch</a>
                <a className="hover:text-slate-300 p-2" href="#">Summarize</a>
                <a className="hover:text-slate-300 p-2" href="#">Code</a>
                <a className="hover:text-slate-300 p-2" href="#">Question</a>
              </nav>
             </div>
              <div className="w-full flex justify-center items-center">
              <iframe 
              src="https://www.youtube.com/embed/HFfXvfFe9F8"
              width="" height="" ref={videoElement} onLoad={onReady} 
              className ="shadow-2xl rounded-md w-full md:w-11/12 lg:w-8/12 aspect-video" >
              </iframe>
              </div>
            </main>
    </>
    }
  