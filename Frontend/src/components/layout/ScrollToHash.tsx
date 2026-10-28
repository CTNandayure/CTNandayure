import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export function ScrollToHash() {
  const { pathname, hash } = useLocation()
  const navType = useNavigationType()
  const userInteractedRef = useRef(false)

  useEffect(() => {
    userInteractedRef.current = false

    if (!hash) {
      if (navType !== 'POP') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }
      return
    }

    const id = hash.replace('#', '')

    const handleUserInteraction = () => {
      userInteractedRef.current = true
    }

    window.addEventListener('wheel', handleUserInteraction, { passive: true })
    window.addEventListener('touchmove', handleUserInteraction, { passive: true })

    const scrollToTarget = () => {
      if (userInteractedRef.current) return
      const el = document.getElementById(id)
      if (el) {
        const headerOffset = 80
        const elementPosition = el.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition >= 0 ? offsetPosition : 0,
          behavior: 'smooth',
        })
      }
    }

    scrollToTarget()

    const t1 = setTimeout(scrollToTarget, 50)
    const t2 = setTimeout(scrollToTarget, 150)
    const t3 = setTimeout(scrollToTarget, 300)
    const t4 = setTimeout(scrollToTarget, 600)
    const t5 = setTimeout(scrollToTarget, 1000)

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        scrollToTarget()
      })
      observer.observe(document.body)
    }

    const maxTimer = setTimeout(() => {
      if (observer) observer.disconnect()
      window.removeEventListener('wheel', handleUserInteraction)
      window.removeEventListener('touchmove', handleUserInteraction)
    }, 2500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      clearTimeout(maxTimer)
      if (observer) observer.disconnect()
      window.removeEventListener('wheel', handleUserInteraction)
      window.removeEventListener('touchmove', handleUserInteraction)
    }
  }, [pathname, hash, navType])

  return null
}
