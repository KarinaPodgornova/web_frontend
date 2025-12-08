// pages/CurrentCalculationsPage/CurrentCalculationsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import { listCurrentCalculations, getCurrentCart, getCurrentCalculation } from '../../modules/CurrentApi';
import './CurrentCalculationsPage.css';

interface CalculationItem {
  current_id?: number;
  id?: number;
  status?: string;
  creator_login?: string;
  created_at?: string;
  form_date?: string;
  finish_date?: string;
  moderator_login?: string;
  voltage_bord?: number;
  devices_count?: number;
  amperage?: number;
  total_amperage?: number;
}

export default function CurrentCalculationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.user);

  const [allCalculations, setAllCalculations] = useState<CalculationItem[]>([]);
  const [displayedCalculations, setDisplayedCalculations] = useState<CalculationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Фильтры
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
  const loadCurrentWithAmperage = async (currentId: number): Promise<number> => {
    try {
      const data = await getCurrentCalculation(currentId);
      
      // Рассчитываем силу тока из currentDevices
      if (data && data.currentDevices && Array.isArray(data.currentDevices)) {
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
      const allCalculationsData = await listCurrentCalculations();
      
      // Добавляем черновик
      let draftCalculation = null;
      try {
        const cartData = await getCurrentCart();
        if (cartData) {
          draftCalculation = {
            ...cartData,
            current_id: cartData.current_id || cartData.id,
            status: 'draft'
          };
        }
      } catch (cartError: any) {
        console.log('Черновика нет');
      }
      
      const allCalculationsList = draftCalculation 
        ? [draftCalculation, ...allCalculationsData]
        : allCalculationsData;
      
      // Для завершенных заявок загружаем силу тока
      const calculationsWithAmperage = await Promise.all(
        allCalculationsList.map(async (item) => {
          if ((item.status === 'completed' || item.status === 'finished') && (item.current_id || item.id)) {
            try {
              const currentId = item.current_id || item.id!;
              const totalAmperage = await loadCurrentWithAmperage(currentId);
              return {
                ...item,
                total_amperage: totalAmperage
              };
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
      setError(err.message || 'Ошибка загрузки расчётов');
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

  const getStatusText = (status?: string) => {
    const map: Record<string, string> = {
      draft: 'Черновик',
      formed: 'Сформирована',
      completed: 'Завершена',
      rejected: 'Отклонена',
      finished: 'Завершена',
      declined: 'Отклонена',
    };
    return status ? (map[status] || status) : '—';
  };
  
  const getStatusClass = (status?: string) => {
    const map: Record<string, string> = {
      draft: 'status-draft',
      formed: 'status-formed',
      completed: 'status-completed',
      rejected: 'status-rejected',
      finished: 'status-completed',
      declined: 'status-rejected',
    };
    return status ? (map[status] || '') : '';
  };

  const handleOpenCalculation = (id?: number) => {
    if (id) {
      navigate(`/current/${id}`);
    }
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

  // Функция для получения результата расчёта (необходимая сила тока)
  const getCalculationResult = (item: CalculationItem) => {
    if (item.status === 'completed' || item.status === 'finished') {
      if (item.total_amperage !== undefined && item.total_amperage !== null) {
        return `${parseFloat(item.total_amperage.toString()).toFixed(2)} А`;
      }
    }
    return '—';
  };

  // Функция для форматирования даты
  const formatDate = (dateString?: string) => {
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
                {displayedCalculations.map((item, index) => (
                  <div
                    key={item.current_id || item.id || index}
                    className={`currents-table-row ${item.status === 'draft' ? 'draft-row' : ''}`}
                    onClick={() => handleOpenCalculation(item.current_id || item.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>{item.current_id || item.id || '—'}</span>

                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>

                    <span>{item.creator_login || '—'}</span>

                    <span>{formatDate(item.created_at)}</span>

                    <span>{formatDate(item.form_date)}</span>

                    <span>{formatDate(item.finish_date)}</span>

                    <span>{item.moderator_login || '—'}</span>

                    <span className="result-column">
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