import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import { getUserProfile, updateUserProfile, loginUser } from '../../modules/UserApi';
import './AccountPage.css';

interface UserProfile {
  login: string;
  is_moderator: boolean;
  id: string;
  password?: string;
}

export default function AccountPage() {
  const navigate = useNavigate();
  
  const { isAuthenticated, username } = useAppSelector(state => state.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    loadProfile();
  }, [isAuthenticated, navigate]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const userData = await getUserProfile(username);
      
      if (userData && userData.login && userData.id !== undefined) {
        const profileData: UserProfile = {
          login: userData.login,
          is_moderator: userData.is_moderator || false,
          id: userData.id
        };
        setProfile(profileData);
      } else {
        setError('Неверный формат данных профиля');
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка загрузки профиля');
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCurrentPassword = async (inputPassword: string): Promise<boolean> => {
    try {
      const result = await loginUser({
        login: username,
        password: inputPassword
      });
      
      return result !== null;
    } catch (error) {
      console.error('Ошибка при проверке пароля:', error);
      return false;
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setError('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Все поля обязательны для заполнения');
      setChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Новый пароль должен быть не менее 6 символов');
      setChangingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Новые пароли не совпадают');
      setChangingPassword(false);
      return;
    }

    if (newPassword === currentPassword) {
      setError('Новый пароль должен отличаться от текущего');
      setChangingPassword(false);
      return;
    }

    try {
      const isCurrentPasswordValid = await verifyCurrentPassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        setError('Текущий пароль указан неверно');
        setChangingPassword(false);
        return;
      }

      const updateData = {
        password: newPassword,
        is_moderator: profile?.is_moderator || false
      };

      await updateUserProfile(username, updateData);

      setSuccessMessage('Пароль успешно изменен!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Ошибка смены пароля');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Header />
        <div className="loading">Загрузка профиля...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      
      <main>
        <div className="profile-header">
          <h1>Личный кабинет</h1>
          <p>Управление вашим профилем</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <div className="profile-content">
          <div className="profile-section">
            <h2>Информация о профиле</h2>
            <div className="profile-info">
              <div className="info-item">
                <label>Логин:</label>
                <span>{profile?.login || username}</span>
              </div>
              <div className="info-item">
                <label>ID:</label>
                <span>{profile?.id || '—'}</span>
              </div>
              <div className="info-item">
                <label>Роль:</label>
                <span>{profile?.is_moderator ? 'Модератор' : 'Пользователь'}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Смена пароля</h2>
            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Текущий пароль</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Введите текущий пароль"
                  required
                  disabled={changingPassword}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Новый пароль</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Введите новый пароль (мин. 6 символов)"
                  required
                  minLength={6}
                  disabled={changingPassword}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Подтвердите новый пароль</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  required
                  disabled={changingPassword}
                />
              </div>

              <button 
                type="submit" 
                className="btn-change-password"
                disabled={changingPassword}
              >
                {changingPassword ? 'Смена пароля...' : 'Сменить пароль'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}