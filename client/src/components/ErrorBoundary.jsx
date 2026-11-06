import { Component } from 'react'
import { useI18n } from '../lib/i18n'

// If a component throws while rendering, React removes the WHOLE page (that was the blank-page bug).
// An error boundary catches the error and shows a message instead. Error boundaries still have to be
// class components: there is no hook for this in React yet.
export class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info.componentStack)
  }

  render() {
    return this.state.failed ? <CrashMessage /> : this.props.children
  }
}

function CrashMessage() {
  const { t } = useI18n()
  return (
    <main role="alert" className="mx-auto w-[90%] max-w-lg py-[58px] sm:py-[82px]">
      <h1 className="mb-3 text-[1.8rem] leading-[1.2] font-bold text-forest">{t('crash.title')}</h1>
      <p className="mb-6 text-muted">{t('crash.text')}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="cursor-pointer rounded-[5px] bg-brand px-[22px] py-[13px] font-bold text-white hover:bg-forest"
      >
        {t('crash.reload')}
      </button>
    </main>
  )
}
