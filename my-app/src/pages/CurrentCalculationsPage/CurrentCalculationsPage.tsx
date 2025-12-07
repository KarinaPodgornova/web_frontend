// pages/CurrentCalculationsPage/CurrentCalculationsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import { listCurrentCalculations, getCurrentCart } from '../../modules/CurrentApi';
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
}

export default function CurrentCalculationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.user);

  const [calculations, setCalculations] = useState<CalculationItem[]>([]);
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
    loadCalculations();
  }, [isAuthenticated, navigate]);

  const loadCalculations = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Подготавливаем фильтры
      const filters: any = {};
      if (fromDate) filters['from-date'] = fromDate;
      if (toDate) filters['to-date'] = toDate;
      if (statusFilter !== 'all') filters.status = statusFilter;
      
      // Загружаем все заявки
      const allCalculations = await listCurrentCalculations(filters);
      
      // Загружаем корзину (черновик)
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
      } catch (cartError) {
        console.log('Черновика нет');
      }
      
      // Объединяем черновик с остальными заявками
      const combinedCalculations = draftCalculation 
        ? [draftCalculation, ...allCalculations]
        : allCalculations;
      
      setCalculations(combinedCalculations);
      
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки расчётов');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCalculations();
  };

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setStatusFilter('all');
    // Перезагружаем без фильтров
    loadCalculations();
  };

  const getStatusText = (status?: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'Черновик',
      'formed': 'Сформирована',
      'completed': 'Завершена',
      'finished': 'Завершена',
      'rejected': 'Отклонена',
      'declined': 'Отклонена',
    };
    return status ? statusMap[status] || status : '—';
  };
  
  const getStatusClass = (status?: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'status-draft',
      'formed': 'status-formed',
      'completed': 'status-completed',
      'finished': 'status-completed',
      'rejected': 'status-rejected',
      'declined': 'status-rejected',
    };
    return status ? statusMap[status] || '' : '';
  };

  const handleOpenCalculation = (id?: number) => {
    if (id) {
      navigate(`/current/${id}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return '—';
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

        {/* Фильтры */}
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
          {calculations.length > 0 ? (
            <div className="currents-table-wrapper">
              <div className="currents-table-header">
                <span>ID</span>
                <span>Статус</span>
                <span>Создатель</span>
                <span>Дата создания</span>
                <span>Дата формирования</span>
                <span>Дата завершения</span>
                <span>Устройств</span>
                <span>Напряжение</span>
              </div>

              <div className="currents-table-body">
                {calculations.map((item, index) => (
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

                    <span>{item.devices_count || 0}</span>

                    <span>{item.voltage_bord ? `${item.voltage_bord} В` : '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              {error ? (
                <>
                  <p>{error}</p>
                  <button 
                    className="btn-secondary" 
                    onClick={handleResetFilters}
                  >
                    Попробовать снова
                  </button>
                </>
              ) : (
                <>
                  <p>Расчёты не найдены</p>
                  <button 
                    className="btn-primary" 
                    onClick={() => navigate('/devices')}
                  >
                    Создать новый расчёт
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