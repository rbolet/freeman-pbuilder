function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold text-white">👋 Hello World!</h1>
        <p className="mb-8 text-xl text-slate-300">
          Welcome to Freeman Proposal Builder
        </p>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
          <p className="text-slate-400">
            Built with Electron + React + TypeScript + TailwindCSS
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
