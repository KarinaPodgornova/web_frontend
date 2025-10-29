// components/Header/Header.tsx
import './Header.css';

export default function Header() {
  return (
    <header>
      <nav className="navbar">
        <div className="header-container">
          <a href="/">
            <div className="logo">
              <span className="logo-text">Устройства для BMW</span>
              <div className="logo-small">
                <img src="http://localhost:9000/lab1/img/icon-logo.f2ce70f.svg" className="logo-small-image" alt="BMW Logo" />
              </div>
            </div>
          </a>
        </div>
      </nav>
    </header>
  );
}