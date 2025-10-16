import { NavLink } from 'react-router-dom'

import './AppHeader.css'

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">Stream AI</div>
        <nav className="app-header__nav">
          <NavLink to="/ai-chat" className={({ isActive }) => isActive ? 'app-header__link app-header__link--active' : 'app-header__link'}>
            文本对话
          </NavLink>
          <NavLink to="/voice-chat" className={({ isActive }) => isActive ? 'app-header__link app-header__link--active' : 'app-header__link'}>
            语音对话
          </NavLink>
        </nav>
      </div>
    </header>
  )
}


