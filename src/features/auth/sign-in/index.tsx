import { LeftPanel } from './components/left-panel'
import { RightPanel } from './components/right-panel'

export default function SignIn() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative grid min-h-svh lg:grid-cols-[1.2fr_0.8fr]">
        <LeftPanel />
        <RightPanel />
      </div>
    </div>
  )
}
