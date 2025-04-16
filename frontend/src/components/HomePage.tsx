function HomePgae() {
  return (
    <>
    <div className="min-h-screen bg-cover bg-center bg-no-repeat">
    
    <div className="max-w-7xl mx-auto px-4 py-16 text-center text-white">
      <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold mb-6 text-center bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Welcome</h1>
      <h2 className="text-base sm:text-lg md:text-xl font-extrabold uppercase mb-12 text-gray-100 drop-shadow">
        Ready to Rally? Let the Ping Pong Battles Begin!</h2>
        <div className="w-full aspect-video mb-16 flex items-center justify-center">
            <div className="w-full aspect-video mb-16 flex items-center justify-center">
            <div className="w-full h-full rounded-2xl p-1 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 shadow-[0_0_30px_rgba(255,0,255,0.6)]">
            <div className="w-full h-full bg-black rounded-xl overflow-hidden">
    <video className="w-full h-full object-cover" autoPlay muted loop>
      <source src="/video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
        </video>
        </div>
        </div>
        </div>
    </div>

      <div className="flex justify-center items-center mt-10" >
        <button className="bg-black text-white px-6 py-3 sm:px-10 text-base sm:text-xl rounded-2xl uppercase active:scale-95 tracking-widest transition-all ease-out duration-300 hover:bg-white hover:text-black hover:shadow-lg h-full">Sign Up</button>
      </div>
      <p className="text-lg font-bold text-gray-100 text-center mt-4 drop-shadow"  >Don't Have An Account Yet?</p>
    </div>
    </div>
    </>
  );
}
export default HomePgae;
