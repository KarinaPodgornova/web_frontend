import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../../store';
import { loginSuccess, loginFailure } from '../../store/slices/userSlice';
import { registerUser, loginUser } from '../../modules/UserApi';
import Header from '../../components/Header/Header';
import './SignUpPage.css';

export default function SignUpPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    login: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.login || !form.password || !form.confirmPassword) {
      setValidationError('Все поля обязательны для заполнения');
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setValidationError('Пароли не совпадают');
      return;
    }

    if (form.password.length < 6) {
      setValidationError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);
    setError('');
    setValidationError('');

    try {
      // Регистрация
      await registerUser({ 
        login: form.login, 
        password: form.password 
      });
      
      // Автоматический вход после регистрации
      const loginResult = await loginUser({ 
        login: form.login, 
        password: form.password 
      });
      
      if (loginResult?.token) {
        localStorage.setItem('token', loginResult.token);
        dispatch(loginSuccess({ username: form.login }));
        navigate('/devices');
      } else {
        throw new Error('Токен не получен');
      }
      
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
      dispatch(loginFailure(err.message || 'Ошибка регистрации'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page">
      <Header />
      
      <div className="reg-container">
        <div className="reg-form-wrapper">
          <h1>Регистрация</h1>
          
          {(error || validationError) && (
            <div className="error-message">
              {error || validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="reg-form">
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
                placeholder="Введите пароль (не менее 6 символов)"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <input
                type="password"
                id="confirmPassword"
                value={form.confirmPassword}
                onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                placeholder="Повторите пароль"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="reg-button"
              disabled={loading || !form.login || !form.password || !form.confirmPassword}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="reg-links">
            <p>
              Уже есть аккаунт? <Link to="/signin">Войти</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}