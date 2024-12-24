import { Wizard } from "./_components/wizard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-600 to-slate-800 text-white">
      <div className="container flex flex-col items-center justify-center">
        <h1 className="mb-8 text-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Zealthy Onboarding
        </h1>

        <div className="w-full rounded-xl bg-slate-700 sm:w-2/3 lg:w-1/2">
          <Wizard />
        </div>
      </div>
    </main>
  );
}
