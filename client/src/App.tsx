import { BrowserRouter } from 'react-router-dom'

import { AppLayout } from './app/AppLayout'
import { AutoSpeakProvider } from './contexts/AutoSpeakContext'

function App() {
  return (
    <BrowserRouter>
      <AutoSpeakProvider>
        <AppLayout />
      </AutoSpeakProvider>
    </BrowserRouter>
  )
}

export default App