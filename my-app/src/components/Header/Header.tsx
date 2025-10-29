// components/Header/Header.tsx
import './Header.css';
import logo0 from '../../assets/icon-logo.f2ce70f.svg'

export default function Header() {
  return (
    <header>
      <nav className="navbar">
        <div className="header-container">
          <a href="/">
            <div className="logo">
              <span className="logo-text">Устройства для BMW</span>
              <div className="logo-small">
                <img src={logo0} className="logo-small-image" alt="BMW Logo" />
              </div>
            </div>
          </a>
        </div>
      </nav>
    </header>
  );
}