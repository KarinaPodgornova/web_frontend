import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../api';
import './CurrentCalculationsPage.css';

export default function CurrentCalculationsPage() { // ИЗМЕНИЛ НАЗВАНИЕ КОМПОНЕНТА
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.user);

  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    loadCalculations();
  }, [isAuthenticated, navigate]);

  const loadCalculations = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Загружаем обычные заявки
      const response = await api.currentCalculations.currentCalculationsList();
      let allCalculations = [...response.data];
      
      // 2. Пробуем загрузить черновик (корзину)
      try {
        const cartResponse = await api.currentCalculations.currentCartList();
        const draft = cartResponse.data;
        
        console.log('Черновик загружен:', draft);
        
        // Если есть черновик, просто добавляем статус
        if (draft && (draft.current_id || draft.id)) {
          // Добавляем поле status если его нет
          if (!draft.status) {
            draft.status = 'draft';
          }
          
          // Убедимся что есть current_id
          if (!draft.current_id && draft.id) {
            draft.current_id = draft.id;
          }
          
          // Добавляем черновик в начало списка
          allCalculations = [draft, ...allCalculations];
        }
      } catch (cartError: any) {
        // Черновика нет - это нормально
        console.log('Черновика нет:', cartError?.response?.status);
      }
      
      setCalculations(allCalculations);
      
    } catch (err: any) {
      setError(err.response?.data?.description || 'Ошибка загрузки расчётов');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      draft: 'Черновик', // ← ДОБАВЬТЕ ЭТО
      formed: 'Сформирована',
      completed: 'Завершена',
      rejected: 'Отклонена',
      finished: 'Завершена',
      declined: 'Отклонена',
    };
    return map[status] || status;
  };
  
  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      draft: 'status-draft', // ← ДОБАВЬТЕ ЭТО
      formed: 'status-formed',
      completed: 'status-completed',
      rejected: 'status-rejected',
      finished: 'status-completed',
      declined: 'status-rejected',
    };
    return map[status] || '';
  };

  const handleOpenCalculation = (id: number) => {
    navigate(`/current/${id}`);
  };

  if (loading) {
    return (
      <div className="currents-list-page"> {/* ИЗМЕНИЛ КЛАСС */}
        <Header />
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
  <div className="currents-list-page">
    <Header />
    <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.CURRENTS }]} />
    
    <main>
      <div className="currents-header">
        <h1>Мои расчёты</h1>
        <p>Всего: {calculations.length}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="currents-container">
        {calculations.length > 0 ? (
          <div className="currents-table-wrapper">
            <div className="currents-table-header">
              <span>ID</span>
              <span>Статус</span>
              <span>Создатель</span>
              <span>Дата создания</span>
              <span>Дата формирования</span>
              <span>Дата завершения</span>
              <span>Модератор</span>
            </div>

            <div className="currents-table-body">
              {calculations.map((item) => (
                <div
                  key={item.current_id}
                  className={`currents-table-row ${item.status === 'draft' ? 'draft-row' : ''}`}
                  onClick={() => handleOpenCalculation(item.current_id)}
                >
                  <span>{item.current_id}</span>

                  <span className={`status-badge ${getStatusClass(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>

                  <span>{item.creator_login || '—'}</span>

                  <span>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString('ru-RU')
                      : '—'}
                  </span>

                  <span>
                    {item.form_date
                      ? new Date(item.form_date).toLocaleDateString('ru-RU')
                      : '—'}
                  </span>

                  <span>
                    {item.finish_date
                      ? new Date(item.finish_date).toLocaleDateString('ru-RU')
                      : '—'}
                  </span>

                  <span>{item.moderator_login || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Расчёты не найдены</p>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/devices')}
            >
              Создать новый расчёт
            </button>
          </div>
        )}
      </div>
    </main>
  </div>
);
}