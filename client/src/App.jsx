import { BrowserRouter, Routes, Route } from 'react-router'
import { I18nProvider } from './lib/i18n'
import { TripPlanProvider } from './lib/trip-plan'
import { DemoBanner } from './components/DemoBanner'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Tours } from './components/Tours'
import { About } from './components/About'
import { Reviews } from './components/Reviews'
import { PlanTrip } from './components/PlanTrip'
import { Footer } from './components/Footer'
import { AuthForm } from './components/AuthForm'
import { TourPage } from './components/TourPage'
import { BookingPage } from './components/BookingPage'
import { CheckoutSuccess } from './components/CheckoutSuccess'
import { Credits } from './components/Credits'
import { NotFound } from './components/NotFound'
import { ScrollToTop } from './components/ScrollToTop'
import { ErrorBoundary } from './components/ErrorBoundary'

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
      <I18nProvider>
        <TripPlanProvider>
          {/* Outer boundary: even if the header crashes, the visitor sees a message, not a blank page. */}
          <ErrorBoundary>
            <ScrollToTop />
            <DemoBanner />
            <Header />
            {/* Inner boundary: if one page crashes, the header and footer stay and a message replaces the page. */}
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tours/:slug" element={<TourPage />} />
                <Route path="/login" element={<AuthForm mode="signin" />} />
                <Route path="/signup" element={<AuthForm mode="signup" />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/credits" element={<Credits />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
            <Footer />
          </ErrorBoundary>
        </TripPlanProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}

export default App
