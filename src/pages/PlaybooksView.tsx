import {
  ArrowRight,
  Check,
  FileQuestion,
  Hammer,
  HeartPulse,
  Home,
  ShoppingBag,
  Umbrella,
} from 'lucide-react'
import { getPlaybook, playbooks } from '../lib/playbooks'

const icons = {
  'home-repair': Home,
  'purchase-problem': ShoppingBag,
  'insurance-claim': Umbrella,
  'contractor-work': Hammer,
  'medical-bill': HeartPulse,
  other: FileQuestion,
}

export function PlaybooksView({ onNewCase }: { onNewCase: (playbookId?: string) => void }) {
  const [featured, ...rest] = playbooks
  const featuredBook = getPlaybook(featured.id)

  return (
    <div>
      <section className="page-heading">
        <div>
          <span className="eyebrow">Guided, not prescriptive</span>
          <h1>
            A calm route through
            <br />
            <em>messy situations.</em>
          </h1>
        </div>
        <p>
          Playbooks are evidence and communication prompts—not jurisdiction-specific legal advice.
          Every prompt is visible, deterministic, and runs without an AI service.
        </p>
      </section>

      <article
        className="featured-playbook"
        style={{ '--playbook-color': featuredBook.color } as React.CSSProperties}
      >
        <div className="featured-playbook__intro">
          <span className="eyebrow">{featuredBook.eyebrow} · Featured</span>
          <h2>{featuredBook.title}</h2>
          <p>{featuredBook.description}</p>
          <button className="button button--ink" onClick={() => onNewCase(featuredBook.id)}>
            Use this playbook <ArrowRight size={17} />
          </button>
        </div>
        <div className="featured-playbook__steps">
          {featuredBook.steps.map((step, index) => (
            <div key={step.id}>
              <span>0{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="featured-playbook__needs">
          <span className="eyebrow">Evidence prompts</span>
          {featuredBook.evidenceNeeds.map((need) => (
            <span key={need.id}>
              <Check size={14} />
              {need.label}
            </span>
          ))}
        </div>
      </article>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Built in</span>
            <h2>Pick the closest shape</h2>
          </div>
          <p>You can always use “Something else” and keep the structure flexible.</p>
        </div>
        <div className="playbook-library">
          {rest.map((playbook) => {
            const Icon = icons[playbook.id as keyof typeof icons] ?? FileQuestion
            return (
              <article
                key={playbook.id}
                style={{ '--playbook-color': playbook.color } as React.CSSProperties}
              >
                <div className="playbook-library__icon">
                  <Icon size={23} />
                </div>
                <span className="eyebrow">{playbook.eyebrow}</span>
                <h3>{playbook.title}</h3>
                <p>{playbook.description}</p>
                <div className="playbook-library__meta">
                  <span>{playbook.steps.length} guided stages</span>
                  <span>{playbook.evidenceNeeds.length} evidence prompts</span>
                </div>
                <button onClick={() => onNewCase(playbook.id)}>
                  Start a case <ArrowRight size={16} />
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="plain-language-banner">
        <span className="plain-language-banner__mark">Aa</span>
        <div>
          <span className="eyebrow">Plain-language promise</span>
          <h2>No “likelihood scores.” No invented rights. No dark patterns.</h2>
          <p>
            Plaincase organizes what you record and points out structural gaps. It never predicts
            an outcome, makes a legal judgment, or sells your situation to an advertiser.
          </p>
        </div>
      </section>
    </div>
  )
}
