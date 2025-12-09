import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../api';
//import './ModeratorPage.css';

interface CurrentCalculation {
  current_id: number;
  creator_login: string;
  status: string;
  created_at: string;
  total_amperage?: number;
  form_date?: string;
  finish_date?: string;
  moderator_login?: string;
  voltage_bord?: number;
}

export default function ModeratorPage() {
  const navigate = useNavigate();
  
  const { isAuthenticated, username } = useAppSelector(state => state.user);
  const [currentCalculations, setCurrentCalculations] = useState<CurrentCalculation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');

  const [pollingCount, setPollingCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    checkModeratorRights();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    loadCurrentCalculations();
    
    const interval = setInterval(() => {
      setPollingCount(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [pollingCount, statusFilter, dateFrom, dateTo, creatorFilter]);

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

  const loadCurrentCalculations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFrom) params['from-date'] = dateFrom;
      if (dateTo) params['to-date'] = dateTo;
      
      const response = await api.currentCalculations.currentCalculationsList(params);
      
      let filteredCalculations = response.data;

      if (creatorFilter.trim()) {
        filteredCalculations = filteredCalculations.filter((current: CurrentCalculation) =>
          current.creator_login.toLowerCase().includes(creatorFilter.toLowerCase())
        );
      }
      
      setCurrentCalculations(filteredCalculations);
    } catch (error: any) {
      setError(error.response?.data?.description || 'Ошибка загрузки заявок на расчёт');
    } finally {
      setLoading(false);
    }
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
        const asyncServiceResponse = await fetch('http://localhost:8000/api/v1/calculate-entire-current/', {
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
      
      loadCurrentCalculations();
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

  const filteredCalculations = statusFilter === 'all' 
    ? currentCalculations 
    : currentCalculations.filter(current => current.status === statusFilter);

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
            <span className="stat-item">Всего заявок: {currentCalculations.length}</span>
            <span className="stat-item">Сформированы: {currentCalculations.filter(c => c.status === 'formed').length}</span>
            <span className="stat-item">Выполнены: {currentCalculations.filter(c => c.status === 'completed' || c.status === 'finished').length}</span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="moderator-filters">
          <div className="filter-group">
            <label>Статус заявки:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="content-list-section"
            >
              <option value="all">Все статусы</option>
              <option value="formed">Сформированы</option>
              <option value="completed">Расчёт завершён</option>
              <option value="finished">Завершены</option>
              <option value="declined">Отклонены</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Дата создания от:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="content-list-section"
            />
          </div>

          <div className="filter-group">
            <label>Дата создания до:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="content-list-section"
            />
          </div>

          <div className="filter-group">
            <label>Создатель:</label>
            <input
              type="text"
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              placeholder="Фильтр по логину пользователя"
              className="content-list-section"
            />
          </div>

          <button onClick={loadCurrentCalculations} className="btn-refresh">
            Обновить
          </button>
        </div>

        <div className="current-calculations-table-container">
          {loading ? (
            <div className="loading">Загрузка заявок...</div>
          ) : filteredCalculations.length > 0 ? (
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
                {filteredCalculations.map((current) => (
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
                      {current.total_amperage 
                        ? `${current.total_amperage} А` 
                        : (current.status === 'completed' || current.status === 'finished' 
                          ? 'Рассчитывается...' 
                          : '—'
                        )
                      }
                    </td>
                    <td>{new Date(current.created_at).toLocaleDateString('ru-RU')}</td>
                    <td>{current.form_date ? new Date(current.form_date).toLocaleDateString('ru-RU') : '—'}</td>
                    <td>{current.finish_date ? new Date(current.finish_date).toLocaleDateString('ru-RU') : '—'}</td>
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
              <p>Заявки на расчёт не найдены</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}