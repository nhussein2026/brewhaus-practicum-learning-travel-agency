export function About() {
  return (
    // Mobile: image stacked above text. md and up: side by side.
    <section
      id="about"
      aria-labelledby="about-title"
      className="mx-auto flex w-[90%] max-w-[1100px] flex-col gap-[30px] py-[58px] sm:py-[82px] md:flex-row md:items-center md:gap-[55px]"
    >
      <div className="min-w-0 md:flex-1">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80"
          alt="A peaceful lake surrounded by mountains"
          className="h-full max-h-[300px] min-h-[230px] w-full rounded-lg object-cover md:max-h-none md:min-h-[320px]"
        />
      </div>
      <div className="min-w-0 md:flex-1">
        <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-brand">TRAVEL WITH CONFIDENCE</p>
        <h2 id="about-title" className="mb-3 text-[1.8rem] leading-[1.2] font-bold text-forest sm:text-4xl">
          We make travel feel easy.
        </h2>
        <p className="text-muted">
          At Wanderly, we believe the best journeys bring people closer to the world. We help you
          find memorable destinations and plan trips without the stress.
        </p>
        <a href="#plan" className="mt-2.5 inline-block font-bold text-brand">
          Let's plan something special →
        </a>
      </div>
    </section>
  )
}
