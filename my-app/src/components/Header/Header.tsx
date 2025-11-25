// components/Header/Header.tsx
import { type MouseEvent } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ROUTES } from '../../Routes';
import './Header.css';
import logo0 from '../../assets/icon-logo.f2ce70f.svg';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { logoutUser } from '../../store/slices/userSlice';

export default function Header() {
  const handleBurgerClick = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.classList.toggle('active');
  };
  
  const { isAuthenticated, username } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  const handleMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleLogout = () => {
    dispatch(logoutUser(username));
  };

  return (
    <header className="header">
      <div className="header__wrapper">
        <div className="header__container">
          <div className="header__logo">
            <NavLink to={ROUTES.DEVICES} className="header__logo-link">
              <div className="logo">
                <span className="logo-text">Устройства для BMW</span>
                <div className="logo-small">
                  <img src={logo0} className="logo-small-image" alt="BMW Logo" />
                </div>
              </div>
            </NavLink>
          </div>

          <nav className="header__nav">
            <NavLink to="/" className="header__link">
              Главная
            </NavLink>
            <NavLink to={ROUTES.DEVICES} className="header__link">
              Устройства
            </NavLink>
            
            {isAuthenticated ? (
              <div className="user-menu">
                <NavLink to={`/users/${username}/info`} className="header__link">
                  Профиль
                </NavLink>
                <Link to={`/`} className="header__link" onClick={handleLogout}>
                  Выйти
                </Link>
                <span className="username">Привет, {username}!</span>
              </div>
            ) : (
              <div className="auth-menu">
                <NavLink to="/signin" className="header__link">
                  Войти
                </NavLink>
                <NavLink to="/signup" className="header__link">
                  Регистрация
                </NavLink>
              </div>
            )}
          </nav>
        </div>

        <div className="header__mobile-wrapper" onClick={handleBurgerClick}>
          <div className="header__mobile-target" />
          <div className="header__mobile-menu" onClick={handleMenuClick}>
            <NavLink to="/" className="header__link">
              Главная
            </NavLink>
            <NavLink to={ROUTES.DEVICES} className="header__link">
              Устройства
            </NavLink>
            
            {isAuthenticated ? (
              <div className="user-menu-mobile">
                <NavLink to={`/users/${username}/info`} className="header__link">
                  Профиль
                </NavLink>
                <NavLink to={`/`} className="header__link" onClick={handleLogout}>
                  Выйти
                </NavLink>
                <span className="username">Привет, {username}!</span>
              </div>
            ) : (
              <>
                <NavLink to="/signin" className="header__link">
                  Войти
                </NavLink>
                <NavLink to="/signup" className="header__link">
                  Регистрация
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}