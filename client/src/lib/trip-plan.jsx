import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// The trip plan is the list of tours the visitor wants to book: [{ tourId, travelers }].
// It lives in React context so the tour cards, the header and the booking page all share it,
// and it is copied into localStorage so a refresh (or signing in) doesn't lose it.
const STORAGE_KEY = 'wanderly.tripPlan'
const TripPlanContext = createContext(null)

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export function TripPlanProvider({ children }) {
  const [plans, setPlans] = useState(loadSaved)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    } catch {
      // Storage can be blocked (e.g. private mode). The plan still works for this visit.
    }
  }, [plans])

  // Adds a tour, or changes its traveler count if it is already in the plan.
  function savePlan(tourId, travelers) {
    setPlans((current) =>
      current.some((plan) => plan.tourId === tourId)
        ? current.map((plan) => (plan.tourId === tourId ? { ...plan, travelers } : plan))
        : [...current, { tourId, travelers }],
    )
  }

  function removePlan(tourId) {
    setPlans((current) => current.filter((plan) => plan.tourId !== tourId))
  }

  // useCallback keeps the same function between renders, so pages can safely list it in an effect's dependencies.
  const clearPlans = useCallback(() => setPlans([]), [])

  return (
    <TripPlanContext.Provider value={{ plans, savePlan, removePlan, clearPlans }}>
      {children}
    </TripPlanContext.Provider>
  )
}

export function useTripPlan() {
  return useContext(TripPlanContext)
}
