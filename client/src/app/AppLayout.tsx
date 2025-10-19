import { AppHeader } from './components/AppHeader'
import { AppRouter } from './AppRouter'

import './AppLayout.css'

export function AppLayout() {
  return (
    <div className="app-layout">
      <AppHeader />
      <main className="app-layout__main">
        <AppRouter />
      </main>
    </div>
  )
}
