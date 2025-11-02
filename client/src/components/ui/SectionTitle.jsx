export default function SectionTitle({ title, subtitle }) {
    return (
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-[color:var(--muted)] mt-1">{subtitle}</p>}
      </div>
    );
  }
  