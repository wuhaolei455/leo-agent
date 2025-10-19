import { BrowserRouter } from 'react-router-dom'

import { AppLayout } from './app/AppLayout'

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App