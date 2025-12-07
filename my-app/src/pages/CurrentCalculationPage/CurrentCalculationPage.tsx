// pages/CurrentCalculationPage/CurrentCalculationPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import { 
  getCurrentCalculation, 
  updateCurrentCalculation,
  formCurrentCalculation,
  deleteCurrentCalculation 
} from '../../modules/CurrentApi';
import { 
  updateCurrentDevice, 
  deleteCurrentDevice 
} from '../../modules/CurrentDevicesApi';
import './CurrentCalculationPage.css';
import defaultDevice from '../../assets/DefaultImage.jpg';

interface Device {
  device_id: number;
  name: string;
  power_nominal: number;
  image?: string;
  amount?: number;
  amperage?: number;
}

interface CurrentData {
  current: {
    current_id?: number;
    id?: number;
    status?: string;
    voltage_bord?: number;
    creator_login?: string;
    created_at?: string;
    form_date?: string;
    finish_date?: string;
    moderator_login?: string;
  };
  currentDevices: Array<{
    device_id: number;
    amount: number;
    amperage?: number;
  }>;
  devices: Device[];
}

export default function CurrentCalculationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useAppSelector(state => state.user);

  const [data, setData] = useState<CurrentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [voltageInput, setVoltageInput] = useState('11.5');
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [updatingAmounts, setUpdatingAmounts] = useState<{ [key: number]: boolean }>({});
  const [updatingVoltage, setUpdatingVoltage] = useState(false);

  // Показать уведомление
  const showNotification = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setSuccess('');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Загрузить данные заявки
  const loadCurrentData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const currentData = await getCurrentCalculation(parseInt(id));
      
      if (!currentData) {
        throw new Error('Заявка не найдена');
      }
      
      setData(currentData);
      
      // Устанавливаем напряжение если есть
      if (currentData.current?.voltage_bord) {
        setVoltageInput(currentData.current.voltage_bord.toString());
      }
      
    } catch (err: any) {
      showNotification('error', err.message || 'Ошибка загрузки заявки');
      console.error('Error loading current:', err);
    } finally {
      setLoading(false);
    }
  };

  // Обновить напряжение
  const handleUpdateVoltage = async () => {
    if (!id || !data?.current) return;
    
    const voltageValue = parseFloat(voltageInput);
    if (isNaN(voltageValue) || voltageValue <= 0) {
      showNotification('error', 'Введите корректное значение напряжения');
      return;
    }
    
    if (data.current.status !== 'draft') {
      showNotification('error', 'Только черновики можно редактировать');
      return;
    }
    
    setUpdatingVoltage(true);
    try {
      const result = await updateCurrentCalculation(parseInt(id), {
        voltage_bord: voltageValue
      });
      
      if (result) {
        // Обновляем локальное состояние
        setData(prev => prev ? {
          ...prev,
          current: {
            ...prev.current,
            voltage_bord: voltageValue
          }
        } : null);
        
        showNotification('success', 'Напряжение обновлено');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Ошибка обновления напряжения');
    } finally {
      setUpdatingVoltage(false);
    }
  };

  // Обновить количество устройства
  const handleUpdateDeviceAmount = async (deviceId: number, newAmount: number) => {
    if (!id || !data?.current) return;
    
    if (data.current.status !== 'draft') {
      showNotification('error', 'Только черновики можно редактировать');
      return;
    }
    
    if (newAmount < 1) {
      showNotification('error', 'Количество должно быть больше 0');
      return;
    }
    
    setUpdatingAmounts(prev => ({ ...prev, [deviceId]: true }));
    
    try {
      const result = await updateCurrentDevice(deviceId, parseInt(id), { amount: newAmount });
      
      if (result) {
        // Обновляем локальное состояние
        setData(prev => {
          if (!prev) return null;
          
          const updatedCurrentDevices = prev.currentDevices.map(cd => 
            cd.device_id === deviceId ? { ...cd, amount: newAmount } : cd
          );
          
          return {
            ...prev,
            currentDevices: updatedCurrentDevices
          };
        });
        
        showNotification('success', 'Количество обновлено');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Ошибка обновления количества');
    } finally {
      setUpdatingAmounts(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  // Удалить устройство
  const handleRemoveDevice = async (deviceId: number) => {
    if (!id || !data?.current) return;
    
    if (data.current.status !== 'draft') {
      showNotification('error', 'Только черновики можно редактировать');
      return;
    }
    
    if (!window.confirm('Удалить устройство из расчёта?')) return;
    
    try {
      const result = await deleteCurrentDevice(deviceId, parseInt(id));
      
      if (result) {
        // Обновляем локальное состояние
        setData(prev => {
          if (!prev) return null;
          
          const updatedCurrentDevices = prev.currentDevices.filter(cd => cd.device_id !== deviceId);
          const updatedDevices = prev.devices.filter(d => d.device_id !== deviceId);
          
          return {
            ...prev,
            currentDevices: updatedCurrentDevices,
            devices: updatedDevices
          };
        });
        
        showNotification('success', 'Устройство удалено');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Ошибка удаления устройства');
    }
  };

  // Подтвердить заявку
  const handleFormCalculation = async () => {
    if (!id || !data?.current) return;
    
    if (data.current.status !== 'draft') {
      showNotification('error', 'Только черновики можно подтверждать');
      return;
    }
    
    if (data.devices.length === 0) {
      showNotification('error', 'Добавьте устройства в расчёт');
      return;
    }
    
    try {
      const result = await formCurrentCalculation(parseInt(id));
      
      if (result) {
        // Обновляем статус
        setData(prev => prev ? {
          ...prev,
          current: {
            ...prev.current,
            status: 'formed'
          }
        } : null);
        
        showNotification('success', 'Заявка подтверждена!');
        
        // Через 2 секунды переходим к списку заявок
        setTimeout(() => {
          navigate('/currents');
        }, 2000);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Ошибка подтверждения заявки');
    }
  };

  // Удалить заявку
  const handleDeleteCalculation = async () => {
    if (!id || !data?.current) return;
    
    if (data.current.status !== 'draft') {
      showNotification('error', 'Только черновики можно удалять');
      return;
    }
    
    if (!window.confirm('Вы уверены, что хотите удалить заявку?')) return;
    
    try {
      const result = await deleteCurrentCalculation(parseInt(id));
      
      if (result) {
        showNotification('success', 'Заявка удалена');
        
        // Через 1 секунду переходим к устройствам
        setTimeout(() => {
          navigate('/devices');
        }, 1000);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Ошибка удаления заявки');
    }
  };

  // Обработчик ошибок изображений
  const handleImageError = (deviceId: number) => {
    setImageErrors(prev => ({ ...prev, [deviceId]: true }));
  };

  // Получить URL изображения
  const getImageUrl = (device: Device) => {
    if (imageErrors[device.device_id] || !device.image) {
      return defaultDevice;
    }
    return `http://localhost:9000/lab1/img/${device.image}`;
  };

  // Перейти на страницу устройства
  const handleOpenDevice = (deviceId: number) => {
    navigate(`/devices/${deviceId}`);
  };

  // Получить количество устройства
  const getDeviceAmount = (deviceId: number): number => {
    if (!data?.currentDevices) return 1;
    const currentDevice = data.currentDevices.find(cd => cd.device_id === deviceId);
    return currentDevice?.amount || 1;
  };

  // Получить силу тока устройства
  const getDeviceAmperage = (deviceId: number): number => {
    if (!data?.currentDevices) return 0;
    const currentDevice = data.currentDevices.find(cd => cd.device_id === deviceId);
    return currentDevice?.amperage || 0;
  };

  // Рассчитать общую силу тока
  const calculateTotalAmperage = (): number => {
    if (!data?.currentDevices) return 0;
    
    return data.currentDevices.reduce((total, cd) => {
      return total + (cd.amperage || 0);
    }, 0);
  };

  // Форматировать статус
  const getStatusText = (status?: string): string => {
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

  // Загрузка при монтировании
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    loadCurrentData();
  }, [isAuthenticated, navigate, id]);

  if (loading) {
    return (
      <div className="current-calculation-page">
        <Header />
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="current-calculation-page">
        <Header />
        <div className="not-found">
          <h2>Заявка не найдена</h2>
          <button 
            className="btn-primary"
            onClick={() => navigate('/devices')}
          >
            Вернуться к устройствам
          </button>
        </div>
      </div>
    );
  }

  const current = data.current;
  const devices = data.devices || [];
  const isDraft = current.status === 'draft';
  const totalAmperage = calculateTotalAmperage();

  return (
    <div className="current-calculation-page">
      <Header />
      
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.CURRENTS, path: '/currents' },
          { label: `Расчёт №${current.current_id || current.id || id}` },
        ]}
      />
      
      <main>
        <div className="current-header">
          <h1>Расчёт №{current.current_id || current.id || id}</h1>
          
          <div className="current-info">
            <div className="info-item">
              <span className="info-label">Статус:</span>
              <span className={`status-badge status-${current.status}`}>
                {getStatusText(current.status)}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Создатель:</span>
              <span>{current.creator_login || '—'}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Дата создания:</span>
              <span>{current.created_at ? new Date(current.created_at).toLocaleDateString('ru-RU') : '—'}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Устройств:</span>
              <span>{devices.length}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="notification error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="notification success">
            {success}
          </div>
        )}

        {/* Секция напряжения и силы тока */}
        <div className="voltage-amperage-section">
          <div className="voltage-control">
            <label htmlFor="voltage-input">
              Напряжение бортовой сети:
            </label>
            <div className="voltage-input-group">
              <input
                id="voltage-input"
                type="number"
                value={voltageInput}
                onChange={(e) => setVoltageInput(e.target.value)}
                step="0.1"
                min="0.1"
                max="48"
                disabled={!isDraft || updatingVoltage}
                className="voltage-input"
              />
              <span className="voltage-unit">В</span>
            </div>
            
            {isDraft && (
              <button
                onClick={handleUpdateVoltage}
                disabled={updatingVoltage || parseFloat(voltageInput) === current.voltage_bord}
                className="btn-save-voltage"
              >
                {updatingVoltage ? 'Сохранение...' : 'Сохранить'}
              </button>
            )}
          </div>
          
          <div className="amperage-display">
            <span className="amperage-label">Необходимая сила тока:</span>
            <span className="amperage-value">
              {totalAmperage > 0 ? `${totalAmperage.toFixed(2)} А` : '—'}
            </span>
          </div>
        </div>

        {/* Список устройств */}
        <div className="devices-section">
          <h2>Устройства в расчёте</h2>
          
          {devices.length === 0 ? (
            <div className="no-devices">
              <p>Устройства отсутствуют</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/devices')}
              >
                Добавить устройства
              </button>
            </div>
          ) : (
            <div className="devices-table">
              <div className="devices-table-header">
                <span className="col-image"></span>
                <span className="col-name">Устройство</span>
                <span className="col-power">Мощность</span>
                <span className="col-amount">Количество</span>
                <span className="col-amperage">Сила тока</span>
                {isDraft && <span className="col-actions">Действия</span>}
              </div>
              
              <div className="devices-table-body">
                {devices.map(device => (
                  <DeviceRow
                    key={device.device_id}
                    device={device}
                    amount={getDeviceAmount(device.device_id)}
                    amperage={getDeviceAmperage(device.device_id)}
                    isDraft={isDraft}
                    updating={updatingAmounts[device.device_id] || false}
                    getImageUrl={() => getImageUrl(device)}
                    onImageError={() => handleImageError(device.device_id)}
                    onOpenDevice={() => handleOpenDevice(device.device_id)}
                    onUpdateAmount={(newAmount) => handleUpdateDeviceAmount(device.device_id, newAmount)}
                    onRemove={() => handleRemoveDevice(device.device_id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Действия с заявкой */}
        {isDraft && (
          <div className="current-actions">
            <button 
              className="btn-danger"
              onClick={handleDeleteCalculation}
              disabled={devices.length === 0}
            >
              Удалить заявку
            </button>
            
            <button 
              className="btn-confirm"
              onClick={handleFormCalculation}
              disabled={devices.length === 0}
            >
              Сформировать расчёт
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// Компонент строки устройства
function DeviceRow({
  device,
  amount,
  amperage,
  isDraft,
  updating,
  getImageUrl,
  onImageError,
  onOpenDevice,
  onUpdateAmount,
  onRemove
}: {
  device: Device;
  amount: number;
  amperage: number;
  isDraft: boolean;
  updating: boolean;
  getImageUrl: () => string;
  onImageError: () => void;
  onOpenDevice: () => void;
  onUpdateAmount: (amount: number) => void;
  onRemove: () => void;
}) {
  const [localAmount, setLocalAmount] = useState(amount);

  const handleSaveAmount = () => {
    if (localAmount !== amount) {
      onUpdateAmount(localAmount);
    }
  };

  const handleIncrement = () => {
    if (!isDraft) return;
    setLocalAmount(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (!isDraft) return;
    setLocalAmount(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="device-row">
      <div className="col-image">
        <img 
          src={getImageUrl()}
          alt={device.name}
          onError={onImageError}
          className="device-image"
        />
      </div>
      
      <div className="col-name" onClick={onOpenDevice} style={{ cursor: 'pointer' }}>
        {device.name}
      </div>
      
      <div className="col-power">
        {device.power_nominal} Вт
      </div>
      
      <div className="col-amount">
        {isDraft ? (
          <div className="amount-controls">
            <div className="amount-input-group">
              <button 
                className="amount-btn"
                onClick={handleDecrement}
                disabled={updating}
              >
                -
              </button>
              <input
                type="number"
                value={localAmount}
                onChange={(e) => setLocalAmount(parseInt(e.target.value) || 1)}
                min="1"
                disabled={updating}
                className="amount-input"
              />
              <button 
                className="amount-btn"
                onClick={handleIncrement}
                disabled={updating}
              >
                +
              </button>
            </div>
            <button
              onClick={handleSaveAmount}
              disabled={updating || localAmount === amount}
              className="btn-save-amount"
            >
              {updating ? '...' : 'Сохранить'}
            </button>
          </div>
        ) : (
          <span className="amount-readonly">{amount}</span>
        )}
      </div>
      
      <div className="col-amperage">
        {amperage > 0 ? `${amperage.toFixed(2)} А` : '—'}
      </div>
      
      {isDraft && (
        <div className="col-actions">
          <button 
            className="btn-remove"
            onClick={onRemove}
            disabled={updating}
            title="Удалить из расчёта"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}