import { Link } from 'react-router-dom';
import indexBg from '/indexBg_compressed.png';

function HomePgae() {
  return (
    <section
      className="text-white  h-full flex justify-center items-center bg-cover "
      style={{ backgroundImage: `url(${indexBg})` }}
    >
      <div className="min-h-screen bg-cover bg-center bg-no-repeat">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-white">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold mb-6 text-center bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Welcome
          </h1>
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold uppercase mb-12 text-gray-100 drop-shadow">
            Ready to Rally? Let the Ping Pong Battles Begin!
          </h2>
          <div className="w-[full] lg:w-[55vw] aspect-video mb-4 flex items-center justify-center">
            <div className="w-full lg:w-[55vw]  aspect-video mb-16 flex items-center justify-center">
              <div className="w-full lg:w-[57vw] h-full rounded-2xl p-1 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 shadow-[0_0_30px_rgba(255,0,255,0.6)]">
                <div className="w-full lg:w-[55vw] h-full bg-black rounded-xl overflow-hidden">
                  <video
                    className="w-full lg:w-[55vw] h-full object-cover"
                    autoPlay
                    muted
                    loop
                  >
                    <source src="/video_compressed.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="bg-slate-800/30 border border-slate-400 rounded-md p-6 sm:p-8 shadow-lg backdrop-filter backdrop-blur-sm relative w-full max-w-md">
              <div className="flex flex-col gap-4">
                <Link
                  className="w-full text-center bg-white text-emerald-800 hover:bg-purple-700 hover:text-white py-2 px-6 font-semibold shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_4px_rgba(147,51,234,0.4)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full"
                  to="/login"
                >
                  Login
                </Link>
              </div>
              <p className="text-sm text-gray-300 text-center mt-4">
                Don't Have An Account Yet?{' '}
                <Link className="text-blue-500 font-medium" to="/register">
                  Create One
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default HomePgae;
