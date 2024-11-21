import { useState, useEffect } from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Initial check
    setMatches(mediaQuery.matches)

    // Add listener
    mediaQuery.addEventListener("change", handler)
    
    // Cleanup
    return () => mediaQuery.removeEventListener("change", handler)
  }, [query])

  return matches
}
