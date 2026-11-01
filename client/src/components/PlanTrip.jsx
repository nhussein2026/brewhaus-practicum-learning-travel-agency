export function PlanTrip() {
  return (
    <section id="plan" aria-labelledby="plan-title" className="bg-forest px-[5%] py-[70px] text-center text-white">
      <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-brand">YOUR STORY, YOUR JOURNEY</p>
      <h2 id="plan-title" className="mb-3 text-[1.8rem] leading-[1.2] font-bold sm:text-4xl">
        Ready to plan your next trip?
      </h2>
      <p className="mx-auto mb-[25px] max-w-[560px] text-[#d8e4df]">
        Tell us what inspires you. We'll help you find a trip that feels just right.
      </p>
      <a
        href="mailto:hello@wanderly.example?subject=Plan%20my%20trip"
        className="inline-block rounded-[5px] bg-sand px-[22px] py-[13px] font-bold text-forest hover:bg-white"
      >
        Plan your trip
      </a>
    </section>
  )
}
