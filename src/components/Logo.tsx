interface LogoProps {
  compact?: boolean
  inverse?: boolean
}

export function Logo({ compact = false, inverse = false }: LogoProps) {
  return (
    <div className={`brand ${inverse ? 'brand--inverse' : ''}`} aria-label="Plaincase">
      <span className="brand__mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {!compact && (
        <span className="brand__word">
          plain<span>case</span>
        </span>
      )}
    </div>
  )
}
