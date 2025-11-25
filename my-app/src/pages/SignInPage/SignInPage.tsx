import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store';
import { loginUser } from '../../store/slices/userSlice';
import Header from '../../components/Header/Header';
import './SignInPage.css';

export default function SignInPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.user);
  
  const [form, setForm] = useState({
    login: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.login || !form.password) {
      return;
    }

    try {
      await dispatch(loginUser(form)).unwrap();
      navigate('/devices');
    } catch (error) {
    }
  };

  return (
    <div className="login-page">
      <Header />
      
      <div className="login-container">
        <div className="login-form-wrapper">
          <h1>Вход в систему</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="login">Логин</label>
              <input
                type="text"
                id="login"
                value={form.login}
                onChange={(e) => setForm({...form, login: e.target.value})}
                placeholder="Введите логин"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                placeholder="Введите пароль"
                required
                disabled={loading}
              />
            </div>


            <button 
              type="submit" 
              className="login-button"
              disabled={loading || !form.login || !form.password}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="login-links">
            <p>
              Нет аккаунта? <Link to="/signup">Зарегистрироваться</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
