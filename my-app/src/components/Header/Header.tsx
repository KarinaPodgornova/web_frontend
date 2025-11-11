// components/Header/Header.tsx
import { Link } from 'react-router-dom';
import { ROUTES } from '../../Routes';
import './Header.css';
import logo0 from '../../assets/icon-logo.f2ce70f.svg'

export default function Header() {
  return (
    <header>
      <nav className="navbar">
        <div className="header-container">
          <Link to={ROUTES.DEVICES} className="logo-link">
            <div className="logo">
              <span className="logo-text">Устройства для BMW</span>
              <div className="logo-small">
                <img src={logo0} className="logo-small-image" alt="BMW Logo" />
              </div>
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}

