# Wanderly Travel: BrewHaus Practicum

A one-page travel agency site. It started in Week 1 as plain HTML and CSS. Assignment 2 rebuilds it with **Vite + React + Tailwind CSS v4**, keeping the same content and look.

## Run locally
```bash
npm install
npm run dev
```

## Project structure
```
src/
  data/
    tours.js            # the six tour packages (array of objects)
    reviews.js          # traveler testimonials
  components/
    Header.jsx  Hero.jsx  Tours.jsx  About.jsx  Reviews.jsx  PlanTrip.jsx  Footer.jsx
    TourCard.jsx        # one tour, owns its traveler count
    TravelerStepper.jsx # controlled − / + component
    SectionHeading.jsx  Logo.jsx
  index.css             # Tailwind import + @theme colour tokens
```

## Assignment 2 features
- **Region filter (`useState`)**: `Tours.jsx` stores the selected region. Clicking a button calls `setRegion`, React re-renders, and the visible list is worked out from `tours` on each render.
- **Controlled component**: `TravelerStepper` has no state of its own. `TourCard` owns `travelers` and passes `value={travelers}` and `onChange={setTravelers}`. The stepper shows `value` and calls `onChange` with the new number (kept between 1 and 10). The card then re-renders, and its total price updates with it.
- **Mobile-first Tailwind**: unprefixed classes are for phones, and `sm:`, `md:` and `lg:` add the larger layouts.
