import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../api';
import './ModeratorPage.css';

interface CurrentCalculation {
  current_id: number;
  creator_login: string;
  status: string;
  created_at: string;
  form_date?: string;
  finish_date?: string;
  moderator_login?: string;
  voltage_bord?: number;
  // Добавим локальное поле для расчета
  total_amperage?: number;
}

export default function ModeratorPage() {
  const navigate = useNavigate();
  
  const { isAuthenticated, username } = useAppSelector(state => state.user);
  const [allCalculations, setAllCalculations] = useState<CurrentCalculation[]>([]);
  const [displayedCalculations, setDisplayedCalculations] = useState<CurrentCalculation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [pollingCount, setPollingCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    checkModeratorRights();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    loadAllCalculations();
    
    const interval = setInterval(() => {
      setPollingCount(prev => prev + 1);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, pollingCount, statusFilter, dateFrom, dateTo, creatorFilter]);

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

  const checkModeratorRights = async () => {
    try {
      const response = await api.users.getUsers(username);
      if (!response.data.is_moderator) {
        navigate('/signin');
      }
    } catch (error) {
      setError('Ошибка проверки прав модератора');
    }
  };

  const loadAllCalculations = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Загружаем все заявки без фильтров
      const response = await api.currentCalculations.currentCalculationsList();
      let calculations = [...response.data];
      
      // Для завершенных заявок загружаем детали и рассчитываем силу тока
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
      
    } catch (error: any) {
      setError(error.response?.data?.description || 'Ошибка загрузки заявок на расчёт');
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
    if (dateFrom) {
      const from = new Date(dateFrom);
      filtered = filtered.filter(item => {
        if (!item.created_at) return false;
        const itemDate = new Date(item.created_at);
        return itemDate >= from;
      });
    }
    
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        if (!item.created_at) return false;
        const itemDate = new Date(item.created_at);
        return itemDate <= to;
      });
    }
    
    // Фильтр по создателю
    if (creatorFilter.trim()) {
      filtered = filtered.filter(item =>
        item.creator_login.toLowerCase().includes(creatorFilter.toLowerCase())
      );
    }
    
    setDisplayedCalculations(filtered);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setCreatorFilter('');
    setDisplayedCalculations(allCalculations);
  };

  const startAmperageCalculation = async (currentId: number) => {
    try {
      // Получаем данные о заявке
      const currentResponse = await api.currentCalculations.currentCalculationsDetail(currentId);
      const currentData = currentResponse.data;
      
      // Получаем устройства из заявки
      if (currentData.devices && currentData.current_devices) {
        const devicesForCalculation = currentData.current_devices.map((cd: any) => {
          const device = currentData.devices.find((d: any) => d.device_id === cd.device_id);
          return {
            device_id: cd.device_id,
            amount: cd.amount || 1,
            power_nominal: device?.power_nominal || 0,
            resistance: device?.resistance || 0,
            voltage_nominal: device?.voltage_nominal || 0,
            coeff_efficiency: device?.coeff_efficiency || 0,
            coeff_reserve: device?.coeff_reserve || 0
          };
        });

        // Отправляем запрос в асинхронный сервис для расчёта
        const calculationPayload = {
          current_id: currentId,
          voltage_bord: currentData.voltage_bord || 230,
          devices: devicesForCalculation
        };

        // Вызов асинхронного сервиса для расчёта
        const asyncServiceResponse = await fetch('http://localhost:8000/api/v1/calculate-current/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calculationPayload)
        });

        if (!asyncServiceResponse.ok) {
          throw new Error('Асинхронный сервис не доступен');
        }

        console.log(`Расчёт силы тока для заявки ${currentId} запущен`);
      }
    } catch (error: any) {
      console.error('Ошибка запуска расчёта:', error);
      setError('Не удалось запустить расчёт силы тока');
    }
  };

  const updateCurrentStatus = async (currentId: number, newStatus: string) => {
    try {
      await api.currentCalculations.finishUpdate(currentId, { status: newStatus });
      
      if (newStatus === 'completed' || newStatus === 'finished') {
        await startAmperageCalculation(currentId);
        alert('Заявка одобрена! Расчёт силы тока запущен. Результаты появятся через 5-10 секунд.');
      } else {
        alert(`Статус заявки изменен на "${getStatusText(newStatus)}"`);
      }
      
      loadAllCalculations();
    } catch (error: any) {
      setError(error.response?.data?.description || 'Ошибка обновления статуса заявки');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'draft': 'Черновик',
      'formed': 'Сформирована', 
      'completed': 'Расчёт завершён',
      'rejected': 'Отклонена',
      'declined': 'Отклонена',
      'finished': 'Завершена'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classMap: { [key: string]: string } = {
      'draft': 'status-draft',
      'formed': 'status-formed',
      'completed': 'status-completed',
      'rejected': 'status-rejected',
      'declined': 'status-rejected',
      'finished': 'status-completed'
    };
    return classMap[status] || '';
  };

  const canChangeStatus = (currentStatus: string) => {
    return currentStatus === 'formed';
  };

  const handleRowClick = (currentId: number, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.actions-cell')) {
      e.stopPropagation();
      return;
    }
    navigate(`/current/${currentId}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getStatusOptions = () => {
    return [
      { value: 'all', label: 'Все статусы' },
      { value: 'formed', label: 'Сформированы' },
      { value: 'completed', label: 'Расчёт завершён' },
      { value: 'finished', label: 'Завершены' },
      { value: 'declined', label: 'Отклонены' }
    ];
  };

  // Функция для получения результата расчёта
  const getCalculationResult = (item: CurrentCalculation) => {
    if (item.status === 'completed' || item.status === 'finished') {
      if (item.total_amperage !== undefined && item.total_amperage !== null) {
        return `${parseFloat(item.total_amperage.toString()).toFixed(2)} А`;
      }
    }
    return '—';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return '—';
    }
  };

  return (
    <div className="moderator-page">
      <Header />
      
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.CURRENTS, path: '/currents' },
          { label: 'Панель модератора' },
        ]}
      />
      
      <main>
        <div className="moderator-header">
          <h1>Панель модератора</h1>
          <p>Управление заявками на расчёт силы тока пользователей</p>
          <div className="current-stats">
            <span className="stat-item">Всего заявок: {allCalculations.length}</span>
            <span className="stat-item">Сформированы: {allCalculations.filter(c => c.status === 'formed').length}</span>
            <span className="stat-item">Выполнены: {allCalculations.filter(c => c.status === 'completed' || c.status === 'finished').length}</span>
          </div>
          
          <button 
            className="btn-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Секция фильтров */}
        {showFilters && (
          <div className="moderator-filters-section">
            <form onSubmit={handleFilterSubmit} className="filters-form">
              <div className="filter-group">
                <label>Статус заявки:</label>
                <select 
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
                <label>Дата создания от:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="filter-input"
                  max={dateTo || undefined}
                />
              </div>

              <div className="filter-group">
                <label>Дата создания до:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="filter-input"
                  min={dateFrom || undefined}
                />
              </div>

              <div className="filter-group">
                <label>Создатель:</label>
                <input
                  type="text"
                  value={creatorFilter}
                  onChange={(e) => setCreatorFilter(e.target.value)}
                  placeholder="Фильтр по логину пользователя"
                  className="filter-input"
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

        <div className="current-calculations-table-container">
          {loading ? (
            <div className="loading">Загрузка заявок...</div>
          ) : displayedCalculations.length > 0 ? (
            <table className="moderator-table">
              <thead>
                <tr>
                  <th>ID заявки</th>
                  <th>Создатель</th>
                  <th>Статус</th>
                  <th>Сила тока (А)</th>
                  <th>Дата создания</th>
                  <th>Дата формирования</th>
                  <th>Дата завершения</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {displayedCalculations.map((current) => (
                  <tr 
                    key={current.current_id}
                    className="clickable-row"
                    onClick={(e) => handleRowClick(current.current_id, e)}
                  >
                    <td className="current-id">{current.current_id}</td>
                    <td>{current.creator_login}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(current.status)}`}>
                        {getStatusText(current.status)}
                      </span>
                    </td>
                    <td>
                      {getCalculationResult(current)}
                    </td>
                    <td>{formatDate(current.created_at)}</td>
                    <td>{formatDate(current.form_date || '')}</td>
                    <td>{formatDate(current.finish_date || '')}</td>
                    <td className="actions-cell" onClick={handleActionClick}>
                      {canChangeStatus(current.status) && (
                        <>
                          <button 
                            className="btn-approve"
                            onClick={() => updateCurrentStatus(current.current_id, 'completed')}
                          >
                            Одобрить расчёт
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => updateCurrentStatus(current.current_id, 'rejected')}
                          >
                            Отклонить
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-current-calculations">
              {allCalculations.length === 0 ? (
                <>
                  <p>Заявки на расчёт не найдены</p>
                </>
              ) : (
                <>
                  <p>Нет заявок, соответствующих фильтрам</p>
                  <button 
                    className="btn-secondary" 
                    onClick={handleResetFilters}
                  >
                    Показать все заявки
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