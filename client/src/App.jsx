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
import { ScrollToTop } from './components/ScrollToTop'
import { BookingPage } from './components/BookingPage'
import { TripPlanProvider } from './lib/trip-plan'

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
      <TripPlanProvider>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthForm mode="signin" />} />
          <Route path="/signup" element={<AuthForm mode="signup" />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
        </Routes>
        <Footer />
      </TripPlanProvider>
    </BrowserRouter>
  )
}

export default App
