import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store';
import { loginUser, registerUser } from '../../store/slices/userSlice';
import Header from '../../components/Header/Header';
import './SignUpPage.css';

export default function SignUpPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.user);
  
  const [form, setForm] = useState({
    login: '',
    password: '',
     confirmPassword: ''
  });

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

    if (form.password.length < 8) {
      setValidationError('Пароль должен быть не менее 8 символов');
      return;
    }

    try {
      await dispatch(registerUser({ 
        login: form.login, 
        password: form.password 
      })).unwrap();
      await dispatch(loginUser({ login: form.login, password: form.password })).unwrap();
      navigate('/devices');
    } catch (error) {
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