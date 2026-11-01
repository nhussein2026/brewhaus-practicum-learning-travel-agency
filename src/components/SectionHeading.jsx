export function SectionHeading({ eyebrow, title, id, children }) {
  return (
    <div className="mx-auto mb-9 max-w-[620px] text-center">
      <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-brand">{eyebrow}</p>
      <h2 id={id} className="mb-3 text-[1.8rem] leading-[1.2] font-bold text-forest sm:text-4xl">
        {title}
      </h2>
      {children && <p className="text-muted">{children}</p>}
    </div>
  )
}
