const heroImage =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="flex min-h-[460px] items-center bg-cover bg-center bg-no-repeat px-[5%] py-[70px] text-white sm:min-h-[510px] sm:py-[90px]"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(13, 38, 37, 0.78), rgba(13, 38, 37, 0.15)), url("${heroImage}")`,
      }}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-sand">
          YOUR NEXT ADVENTURE STARTS HERE
        </p>
        <h1 id="hero-title" className="mb-[18px] max-w-[650px] text-[2.5rem] leading-[1.08] font-bold sm:text-6xl lg:text-7xl">
          The world is waiting for you.
        </h1>
        <p className="mb-7 max-w-[520px] text-lg">
          Discover beautiful places, meet new people, and make memories that last a lifetime.
        </p>
        <a
          href="#tours"
          className="inline-block rounded-[5px] bg-brand px-[22px] py-[13px] font-bold hover:bg-forest"
        >
          Explore our tours
        </a>
      </div>
    </section>
  )
}
