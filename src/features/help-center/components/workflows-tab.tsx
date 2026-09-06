import { Link } from '@tanstack/react-router'
import {
  IconBulb,
  IconChevronDown,
  IconCornerDownRight,
  IconInfoCircle,
} from '@tabler/icons-react'
import type { WorkflowGuide, WorkflowStep } from '../data/guide-content'
import { workflowGuides } from '../data/guide-content'

function StepRow({ step, index }: { step: WorkflowStep; index: number }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200/70 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {step.title}
          </h5>
          {step.path && step.pathLabel && (
            <Link
              to={step.path}
              className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:underline dark:text-sky-400"
            >
              {step.pathLabel}
              <IconCornerDownRight size={12} />
            </Link>
          )}
        </div>
        {step.description && (
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {step.description}
          </p>
        )}
      </div>
    </li>
  )
}

function WorkflowCard({ guide }: { guide: WorkflowGuide }) {
  const Icon = guide.icon
  return (
    <details className="group rounded-lg border border-slate-200/70 bg-white/80 shadow-sm open:shadow-md dark:border-white/[0.07] dark:bg-white/5">
      <summary className="flex cursor-pointer list-none items-start gap-3 rounded-lg p-4 [&::-webkit-details-marker]:hidden">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 bg-white text-slate-600 dark:border-white/[0.07] dark:bg-white/5 dark:text-slate-300">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {guide.title}
          </h4>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {guide.summary}
          </p>
        </div>
        <IconChevronDown
          size={18}
          className="mt-2 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="border-t border-slate-200/70 px-4 py-4 dark:border-white/[0.07]">
        {guide.appliesTo && (
          <p className="mb-4 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <IconInfoCircle size={14} className="mt-0.5 shrink-0" />
            {guide.appliesTo}
          </p>
        )}
        <ol className="space-y-4">
          {guide.steps.map((step, index) => (
            <StepRow key={`${guide.id}-${index}`} step={step} index={index} />
          ))}
        </ol>
        {guide.tip && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200/70 bg-amber-50/60 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
            <IconBulb size={14} className="mt-0.5 shrink-0" />
            <p>{guide.tip}</p>
          </div>
        )}
      </div>
    </details>
  )
}

export default function WorkflowsTab() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Step-by-step guides for the most common jobs in the application. Expand
        a guide to follow along — every step that lives in a specific screen
        links straight to it.
      </p>
      {workflowGuides.map((guide) => (
        <WorkflowCard key={guide.id} guide={guide} />
      ))}
    </div>
  )
}
