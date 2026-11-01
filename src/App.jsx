import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Tours } from './components/Tours'
import { About } from './components/About'
import { Reviews } from './components/Reviews'
import { PlanTrip } from './components/PlanTrip'
import { Footer } from './components/Footer'

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Tours />
        <About />
        <Reviews />
        <PlanTrip />
      </main>
      <Footer />
    </>
  )
}

export default App
