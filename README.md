# Wanderly Travel: BrewHaus Practicum

Wanderly is a one-page website for a travel agency, built during the BrewHaus Practicum. The project grows week by week. It started as plain HTML and CSS, and in Assignment 2 it was rebuilt with React and Tailwind. The business, the content and the look stayed the same. The **Development story** below covers each assignment.

---

## Tech stack

| Layer | Tool | Version | What it does here |
|---|---|---|---|
| UI library | [React](https://react.dev) | 19 | Splits the page into components. Handles state with `useState`. |
| Build tool / dev server | [Vite](https://vite.dev) | 8 | Runs the dev server with instant reload. Bundles the production build. |
| React plugin for Vite | `@vitejs/plugin-react` | 6 | Lets Vite handle JSX and Fast Refresh. |
| Styling | [Tailwind CSS](https://tailwindcss.com) | 4 | Utility classes in the JSX. Brand colours live in an `@theme` block. |
| Tailwind plugin for Vite | `@tailwindcss/vite` | 4 | Plugs Tailwind into the Vite build. No PostCSS config needed. |
| Linting | [oxlint](https://oxc.rs) | 1 | Fast JavaScript/JSX linter. |
| Runtime | Node.js | 20+ (built with 22) | Runs npm, Vite and the build. |

Rules for this stage: plain JavaScript (no TypeScript), no extra libraries, and all data hardcoded. A backend comes in Week 3.

---

## Running the project

### Requirements
- Node.js 20 or newer
- npm (comes with Node)

### Install
```bash
npm install
```
This installs everything listed in `package.json` into `node_modules/`.

### Develop
```bash
npm run dev
```
This starts the Vite dev server, usually at <http://localhost:5173>. Saving a file updates the browser straight away, without a full reload (Hot Module Replacement).

### Build for production
```bash
npm run build
```
Vite bundles the app into the `dist/` folder:
- The JSX is compiled to plain JavaScript, then minified and split into hashed files.
- Tailwind scans the source files and outputs only the CSS classes the app actually uses.
- `dist/` is a fully static site. Any static host can serve it (GitHub Pages, Netlify, Vercel, …).

### Preview the production build
```bash
npm run preview
```
This serves the built `dist/` folder locally, so you can check the real production output before deploying.

### Lint
```bash
npm run lint
```

### How it fits together
```
index.html  →  <div id="root">  +  <script src="/src/main.jsx">
src/main.jsx →  imports index.css (Tailwind) and renders <App /> into #root
src/App.jsx  →  puts the page together from the section components
components   →  read their content from src/data/*.js
```

---

## Project structure

```
.
├── index.html               # Vite entry HTML (only a #root div + script tag)
├── vite.config.js           # Vite with the React and Tailwind plugins
├── package.json             # dependencies and npm scripts
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx             # mounts <App /> into the page
    ├── App.jsx              # page layout: Header → Hero → Tours → About → Reviews → PlanTrip → Footer
    ├── index.css            # @import "tailwindcss" + @theme colour tokens
    ├── data/
    │   ├── tours.js         # the 6 tour packages (array of objects)
    │   └── reviews.js       # the 3 traveler testimonials
    └── components/
        ├── Header.jsx           # logo + navigation
        ├── Hero.jsx             # full-width intro banner
        ├── Tours.jsx            # tour grid + region filter (useState)
        ├── TourCard.jsx         # one tour; owns its traveler count
        ├── TravelerStepper.jsx  # controlled − / + component
        ├── About.jsx            # image + "We make travel feel easy"
        ├── Reviews.jsx          # testimonial cards
        ├── PlanTrip.jsx         # dark call-to-action band
        ├── Footer.jsx           # logo, copyright, back to top
        ├── SectionHeading.jsx   # shared eyebrow + title + subtitle
        └── Logo.jsx             # "wanderly." wordmark (header and footer)
```

---

## Development story

### Assignment 1: Static HTML & CSS site (Week 1)

**Goal:** build a responsive one-page site for a business of our choice. Ours is a travel agency.

**What was built**
- `index.html`: one page with semantic sections: header/nav, hero, tour packages, about, reviews, call to action, footer.
- `style.css`:
  - The brand colours were CSS variables (`--color-dark`, `--color-green`, `--color-accent`, …).
  - Flexbox laid out the navbar, the about section and the footer.
  - CSS Grid laid out the tour cards and the review cards.
- The responsive design was **desktop-first**. Base styles targeted large screens, and `max-width` media queries scaled things down:
  - at 800px and below, the tour grid dropped to 2 columns and the reviews to 1 column.
  - at 600px and below, the nav stacked, the tours dropped to 1 column, the about section stacked, and the footer stacked.
- Accessibility basics: `aria-label`s on the nav and the star ratings, `aria-labelledby` on sections, alt text on every image.

**Commits**
- `first commit`: the initial site
- `Add comments for layout responsiveness and adjust styles for better mobile experience`

**Limitations that led to Assignment 2**
- The six tour cards were copy-pasted HTML. Changing a tour meant editing markup.
- Nothing on the page was interactive.
- One large stylesheet, and the responsive rules overrode the desktop styles.

---

### Assignment 2: Rebuild with JavaScript, React & Tailwind (Week 2)

**Goal:** turn the same site into a React + Tailwind app, keeping the business, the content and the look, and add the first real interactivity.

**What changed**

1. **Scaffolded with Vite + React** inside the existing repo. The static `index.html` became Vite's entry file.
2. **Tailwind v4 wired in** with `@tailwindcss/vite`. The Assignment 1 colours moved into an `@theme` block in `src/index.css`, and each one became a Tailwind class (`--color-forest` → `bg-forest`/`text-forest`, `--color-brand` → `text-brand`, …).
3. **Data moved out of the markup.** The tours went into `src/data/tours.js` and the reviews into `src/data/reviews.js`, each an array of objects. The components loop over them with `.map()` instead of repeating JSX. Each tour also got a new `region` field for the filter.
4. **Componentized.** Every page section is its own component: `Header`, `Hero`, `Tours`, `About`, `Reviews`, `PlanTrip` and `Footer`. Pieces used in more than one place became small components too: `SectionHeading`, `Logo` and `TourCard`.
5. **Region filter with `useState`** (`Tours.jsx`).
   - `const [region, setRegion] = useState('All')` holds the selected region.
   - Clicking a button (All / Europe / Asia / Middle East) calls `setRegion`, and React renders the section again.
   - The visible tours are **worked out on every render**, not stored in state:
     `region === 'All' ? tours : tours.filter(t => t.region === region)`
   - The active button gets highlighted styles and `aria-pressed`.
6. **Controlled component: `TravelerStepper`.** It follows the same pattern as BrewHaus's `QuantityStepper`.
   - The stepper has **no state of its own**. It receives `value` and `onChange` as props.
   - `TourCard` owns the state: `const [travelers, setTravelers] = useState(1)`. It passes `value={travelers}` and `onChange={setTravelers}`.
   - Clicking **+** or **−** calls `onChange` with the new number, kept between 1 and 10. The card renders again, and both the count and the **total price** (`price × travelers`) update. The buttons are disabled at the limits.
   - Each card has its own state, so every tour keeps its own traveler count.
7. **Responsive design rewritten mobile-first.** Classes without a prefix style phones. `sm:`, `md:` and `lg:` add the larger layouts. For example, the tour grid is `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`, and the header is stacked by default and becomes a row with `sm:flex-row`.
8. **Old `style.css` removed.** All styling now lives in Tailwind classes plus the small `index.css`.
9. **No horizontal scroll.** Checked at 320, 375, 640, 768, 1024 and 1440px wide.

**Commits (one small step each)**
```
Scaffold Vite + React app in the existing repo
Wire in Tailwind v4 with the Wanderly colour theme
Move tours and reviews into data files
Add Header, Hero and Footer components
Render tour grid from data with TourCard component
Add About, Reviews and PlanTrip sections
Add region filter to the tour grid with useState
Add controlled TravelerStepper to each tour card
Remove old style.css and update README for the React version
```

**Known behaviour / possible next step**
Switching the filter removes the cards that are filtered out, which resets their traveler counts. Moving the counts up into `Tours` (lifting state up) would keep them.

---

### Assignment 3: Backend (Week 3, coming next)

The tour data is hardcoded in `src/data/` for now. Next week it moves to a backend, and the frontend will fetch it.
