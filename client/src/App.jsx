import { BrowserRouter, Routes, Route } from 'react-router'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Tours } from './components/Tours'
import { About } from './components/About'
import { Reviews } from './components/Reviews'
import { PlanTrip } from './components/PlanTrip'
import { Footer } from './components/Footer'
import { AuthForm } from './components/AuthForm'
import { CheckoutSuccess } from './components/CheckoutSuccess'

function Home() {
  return (
    <main>
      <Hero />
      <Tours />
      <About />
      <Reviews />
      <PlanTrip />
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthForm mode="signin" />} />
        <Route path="/signup" element={<AuthForm mode="signup" />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
