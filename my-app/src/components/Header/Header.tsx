// components/Header/Header.tsx
import { type MouseEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../Routes';
import './Header.css';
import logo0 from '../../assets/icon-logo.f2ce70f.svg';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/slices/userSlice'; // Только синхронный экшен
import { logoutUser } from '../../modules/UserApi'; // Чистая функция из модуля

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, username } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  const handleBurgerClick = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.classList.toggle('active');
  };

  const handleMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleLogout = async () => {
    try {
      // Вызываем чистую функцию из модуля
      await logoutUser();
      
      // Диспатчим синхронный экшен для обновления Redux состояния
      dispatch(logout());
      
      // Переходим на главную
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Все равно сбрасываем состояние, даже если запрос не удался
      dispatch(logout());
      navigate('/');
    }
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
                <NavLink to={ROUTES.CURRENTS} className="header__link">
                  Мои заявки
                </NavLink>
                <NavLink to={`/`} className="header__link" onClick={handleLogout}>
                  Выйти
                </NavLink>
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
                <NavLink to={ROUTES.CURRENTS} className="header__link">
                  Мои заявки
                </NavLink>
                <button className="header__link logout-btn" onClick={handleLogout}>
                  Выйти
                </button>
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