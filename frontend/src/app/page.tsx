export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 gap-4">
      <div className="text-2xl md:text-5xl font-extrabold">
      <span className="bg-clip-text py-10 text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
    Doing It By Watching Trying And Asking
  </span>
</div>
        <div className="w-full">
        <input type="text" placeholder="Past the link of a youtube video tutorial to try to practice"
        className="w-full p-4 border-2 outline-none border-gray-300 rounded-3xl
        focus:border-purple-500 focus:ring-2 focus:ring-purple-500"></input>
        </div>
    </main>
  );
}
