import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, loginFailure } from '../../store/slices/userSlice';
import { loginUser } from '../../modules/UserApi';
import Header from '../../components/Header/Header';
import './SignInPage.css';

export default function SignInPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    login: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.login || !form.password) {
      setError('Все поля обязательны');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await loginUser(form);
      
      if (result?.token) {
        localStorage.setItem('token', result.token);
        dispatch(loginSuccess({ username: form.login }));
        navigate('/devices');
      } else {
        throw new Error('Токен не получен');
      }
      
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации');
      dispatch(loginFailure(err.message || 'Ошибка авторизации'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <Header />
      
      <div className="signin-container">
        <div className="signin-form-wrapper">
          <h1>Вход</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="signin-form">
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
              className="signin-button"
              disabled={loading || !form.login || !form.password}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}