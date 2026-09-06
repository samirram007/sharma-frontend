import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { IconArrowRight, IconCircleCheck } from '@tabler/icons-react'
import {
  overviewContent,
  type Concept,
  type GettingStartedStep,
  type Pillar,
} from '../data/guide-content'

function ConceptCard({ concept }: { concept: Concept }) {
  return (
    <div className="rounded-md border border-slate-200/70 bg-white p-4 dark:border-white/[0.07] dark:bg-white/5">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {concept.term}
      </h4>
      <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {concept.description}
      </p>
    </div>
  )
}

function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  return (
    <div className="rounded-md border border-slate-200/70 bg-white p-4 dark:border-white/[0.07] dark:bg-white/5">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100/60 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
          {index + 1}
        </span>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {pillar.title}
        </h4>
      </div>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {pillar.description}
      </p>
    </div>
  )
}

function GettingStartedRow({
  step,
  index,
}: {
  step: GettingStartedStep
  index: number
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-slate-200/70 bg-white p-4 dark:border-white/[0.07] dark:bg-white/5">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {step.title}
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {step.description}
        </p>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 gap-1" asChild>
        <Link to={step.path}>
          {step.pathLabel}
          <IconArrowRight size={14} />
        </Link>
      </Button>
    </div>
  )
}

export default function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* About the app */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <IconCircleCheck
            size={18}
            className="text-blue-600 dark:text-sky-400"
          />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            About this application
          </h3>
        </div>
        <div className="space-y-3 rounded-lg border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-white/[0.07] dark:bg-white/5">
          {overviewContent.intro.map((paragraph) => (
            <p
              key={paragraph}
              className="text-sm leading-relaxed text-slate-600 dark:text-slate-300"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* What it covers */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <IconCircleCheck
            size={18}
            className="text-blue-600 dark:text-sky-400"
          />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            What it covers
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {overviewContent.pillars.map((pillar, index) => (
            <PillarCard key={pillar.title} pillar={pillar} index={index} />
          ))}
        </div>
      </section>

      {/* Key concepts */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <IconCircleCheck
            size={18}
            className="text-blue-600 dark:text-sky-400"
          />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Key concepts
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {overviewContent.concepts.map((concept) => (
            <ConceptCard key={concept.term} concept={concept} />
          ))}
        </div>
      </section>

      {/* Getting started */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <IconCircleCheck
            size={18}
            className="text-blue-600 dark:text-sky-400"
          />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Getting started
          </h3>
        </div>
        <div className="space-y-3">
          {overviewContent.gettingStarted.map((step, index) => (
            <GettingStartedRow key={step.title} step={step} index={index} />
          ))}
        </div>
      </section>

      {/* Explore */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <IconCircleCheck
            size={18}
            className="text-blue-600 dark:text-sky-400"
          />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Jump back in
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {overviewContent.exploreLinks.map((link) => (
            <Button
              key={`${link.path}-${link.label}`}
              variant="outline"
              size="sm"
              asChild
            >
              <Link to={link.path}>{link.label}</Link>
            </Button>
          ))}
        </div>
      </section>
    </div>
  )
}
