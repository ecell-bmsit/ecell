import React from 'react';

const sections = [
  { key: 'strengths', title: 'What is working', tone: 'text-emerald-200' },
  { key: 'assumptionMistakes', title: 'Assumptions to correct', tone: 'text-amber-200' },
  { key: 'immediateQuestions', title: 'Questions to answer now', tone: 'text-sky-200' },
  { key: 'nextSteps', title: 'Next steps', tone: 'text-white', ordered: true },
];

export default function AssessmentResult({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-7 text-left" style={{ fontFamily: 'Satoshi, sans-serif' }}>
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-white">Your idea assessment</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-200">{result.summary}</p>
      </div>

      {result.firstStep && (
        <section className="rounded-xl bg-white/[0.08] p-5 sm:p-6" aria-label="First action">
          <h4 className="text-sm font-semibold text-white">Start here · next 48 hours</h4>
          <p className="mt-2 text-sm leading-7 text-neutral-200">{result.firstStep}</p>
        </section>
      )}

      {result.recommendation && (
        <section>
          <h4 className="text-sm font-semibold text-white">Recommendation</h4>
          <p className="mt-2 text-sm leading-7 text-neutral-300">{result.recommendation}</p>
        </section>
      )}

      <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
        {sections.map(({ key, title, tone, ordered }) => {
          const items = Array.isArray(result[key]) ? result[key] : [];
          if (!items.length) return null;
          const List = ordered ? 'ol' : 'ul';
          return (
            <section key={key}>
              <h4 className={`text-sm font-semibold ${tone}`}>{title}</h4>
              <List className={`mt-3 space-y-2 pl-5 text-sm leading-6 text-neutral-300 ${ordered ? 'list-decimal' : 'list-disc'}`}>
                {items.map((item, index) => <li key={`${key}-${index}`}>{item}</li>)}
              </List>
            </section>
          );
        })}
      </div>

      {Array.isArray(result.gaps) && result.gaps.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold text-white">Other areas to strengthen</h4>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-300">
            {result.gaps.map((gap, index) => <li key={`gap-${index}`}>{gap}</li>)}
          </ul>
        </section>
      )}

      {(result.councilAgrees?.length || result.councilClashes?.length || result.blindSpots?.length) > 0 && (
        <details className="border-t border-white/10 pt-5 text-sm text-neutral-300">
          <summary className="cursor-pointer font-medium text-neutral-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">How the council reached this view</summary>
          <div className="mt-5 space-y-5">
            {[
              ['Where advisors agree', result.councilAgrees],
              ['Where advisors differ', result.councilClashes],
              ['Blind spots found in review', result.blindSpots],
            ].map(([title, items]) => Array.isArray(items) && items.length > 0 && (
              <section key={title}>
                <h5 className="font-semibold text-white">{title}</h5>
                <ul className="mt-2 list-disc space-y-2 pl-5 leading-6">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
              </section>
            ))}
          </div>
        </details>
      )}
      <p className="text-xs leading-5 text-neutral-400">AI guidance is an early exploration tool. Check these claims with customers and mentors.</p>
    </div>
  );
}
