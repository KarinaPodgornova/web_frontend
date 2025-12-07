import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../api';
import './CurrentCalculationsPage.css';

export default function CurrentCalculationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.user);

  const [allCalculations, setAllCalculations] = useState<any[]>([]);
  const [displayedCalculations, setDisplayedCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Состояния для фильтров
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    loadAllCalculations();
  }, [isAuthenticated, navigate]);

  // Функция для расчета силы тока из currentDevices
  const calculateAmperageFromCurrentDevices = (currentDevices: any[]) => {
    if (!currentDevices || !Array.isArray(currentDevices)) return 0;
    
    return currentDevices.reduce((sum: number, currentDevice: any) => {
      const deviceAmperage = currentDevice.amperage || 0;
      return sum + parseFloat(deviceAmperage);
    }, 0);
  };

  // Функция для загрузки деталей заявки и расчета силы тока
  const loadCurrentWithAmperage = async (currentId: number) => {
    try {
      const response = await api.currentCalculations.currentCalculationsDetail(currentId);
      const data = response.data;
      
      // Рассчитываем силу тока из currentDevices
      if (data.currentDevices && Array.isArray(data.currentDevices)) {
        return calculateAmperageFromCurrentDevices(data.currentDevices);
      }
      
      return 0;
    } catch (err) {
      console.error(`Ошибка загрузки заявки #${currentId}:`, err);
      return 0;
    }
  };

  const loadAllCalculations = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Загружаем все заявки без фильтров
      const response = await api.currentCalculations.currentCalculationsList();
      let calculations = [...response.data];
      
      // Добавляем черновик
      try {
        const cartResponse = await api.currentCalculations.currentCartList();
        const draft = cartResponse.data;
        
        if (draft && (draft.current_id || draft.id)) {
          if (!draft.status) {
            draft.status = 'draft';
          }
          
          if (!draft.current_id && draft.id) {
            draft.current_id = draft.id;
          }
          
          calculations = [draft, ...calculations];
        }
      } catch (cartError: any) {
        console.log('Черновика нет');
      }
      
      // Для завершенных заявок загружаем силу тока
      const calculationsWithAmperage = await Promise.all(
        calculations.map(async (item) => {
          if (item.status === 'completed' || item.status === 'finished') {
            try {
              const currentId = item.current_id;
              if (currentId) {
                const totalAmperage = await loadCurrentWithAmperage(currentId);
                return {
                  ...item,
                  total_amperage: totalAmperage
                };
              }
            } catch (err) {
              console.log(`Не удалось загрузить силу тока для заявки ${item.current_id}:`, err);
            }
          }
          return item;
        })
      );
      
      setAllCalculations(calculationsWithAmperage);
      setDisplayedCalculations(calculationsWithAmperage);
      
    } catch (err: any) {
      setError(err.response?.data?.description || 'Ошибка загрузки расчётов');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allCalculations];
    
    // Фильтр по статусу
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    // Фильтр по дате создания
    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter(item => {
        if (!item.created_at) return false;
        const itemDate = new Date(item.created_at);
        return itemDate >= from;
      });
    }
    
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        if (!item.created_at) return false;
        const itemDate = new Date(item.created_at);
        return itemDate <= to;
      });
    }
    
    setDisplayedCalculations(filtered);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setStatusFilter('all');
    setDisplayedCalculations(allCalculations);
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      draft: 'Черновик',
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
      draft: 'status-draft',
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

  const getStatusOptions = () => {
    return [
      { value: 'all', label: 'Все статусы' },
      { value: 'draft', label: 'Черновик' },
      { value: 'formed', label: 'Сформирована' },
      { value: 'completed', label: 'Завершена' },
      { value: 'rejected', label: 'Отклонена' }
    ];
  };

  // Функция для получения результата расчёта
  const getCalculationResult = (item: any) => {
    if (item.status === 'completed' || item.status === 'finished') {
      if (item.total_amperage !== undefined && item.total_amperage !== null) {
        return `${parseFloat(item.total_amperage).toFixed(2)} А`;
      }
    }
    return '—';
  };

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="currents-list-page">
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
          <button 
            className="btn-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Секция фильтров */}
        {showFilters && (
          <div className="filters-section">
            <form onSubmit={handleFilterSubmit} className="filters-form">
              <div className="filter-group">
                <label htmlFor="status-filter">Статус:</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  {getStatusOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="from-date">Дата создания от:</label>
                <input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="filter-input"
                  max={toDate || undefined}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="to-date">Дата создания до:</label>
                <input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="filter-input"
                  min={fromDate || undefined}
                />
              </div>

              <div className="filter-buttons">
                <button type="submit" className="btn-primary">
                  Применить фильтры
                </button>
                <button 
                  type="button" 
                  onClick={handleResetFilters}
                  className="btn-secondary"
                >
                  Сбросить фильтры
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="currents-container">
          {displayedCalculations.length > 0 ? (
            <div className="currents-table-wrapper">
              <div className="currents-table-header">
                <span>ID</span>
                <span>Статус</span>
                <span>Создатель</span>
                <span>Дата создания</span>
                <span>Дата формирования</span>
                <span>Дата завершения</span>
                <span>Модератор</span>
                <span>Необходимая сила тока</span>
              </div>

              <div className="currents-table-body">
                {displayedCalculations.map((item) => (
                  <div
                    key={item.current_id || item.id}
                    className={`currents-table-row ${item.status === 'draft' ? 'draft-row' : ''}`}
                    onClick={() => handleOpenCalculation(item.current_id || item.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>{item.current_id || item.id}</span>

                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>

                    <span>{item.creator_login || '—'}</span>

                    <span>{formatDate(item.created_at)}</span>

                    <span>{formatDate(item.form_date)}</span>

                    <span>{formatDate(item.finish_date)}</span>

                    <span>{item.moderator_login || '—'}</span>

                    <span className="amperage-column">
                      {getCalculationResult(item)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              {allCalculations.length === 0 ? (
                <>
                  <p>Расчёты не найдены</p>
                  <button 
                    className="btn-primary" 
                    onClick={() => navigate('/devices')}
                  >
                    Создать новый расчёт
                  </button>
                </>
              ) : (
                <>
                  <p>Нет расчётов, соответствующих фильтрам</p>
                  <button 
                    className="btn-secondary" 
                    onClick={handleResetFilters}
                  >
                    Показать все расчёты
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}