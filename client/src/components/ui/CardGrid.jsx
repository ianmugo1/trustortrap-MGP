export default function CardGrid({ children, cols = { base:1, md:2, lg:3 }, gap="gap-4" }) {
    const cls = `grid grid-cols-${cols.base} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg} ${gap}`;
    return <div className={cls}>{children}</div>;
  }
  