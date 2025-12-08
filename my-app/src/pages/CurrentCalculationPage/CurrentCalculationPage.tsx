// src/pages/CurrentCalculationPage/CurrentCalculationPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import './CurrentCalculationPage.css';
import defaultDevice from '../../assets/DefaultImage.jpg';

interface Device {
  device_id?: number;
  id?: number;
  name?: string;
  power_nominal?: number;
  image?: string;
  amount?: number;
  amperage?: number;
}

interface CurrentData {
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
  devices?: Device[];
  currentDevices?: any[];
  devices_with_amperage?: any[];
  current_devices?: any[];
}

// Helper функция для fetch с авторизацией
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  
  // Проверяем, есть ли тело ответа
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return await response.json();
  } else {
    return null; // или можно вернуть true для успешных запросов без JSON
  }
};

export default function CurrentCalculationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useAppSelector(state => state.user);

  const [currentCart, setCurrentCart] = useState<CurrentData | null>(null);
  const [currentDetail, setCurrentDetail] = useState<CurrentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [voltageInput, setVoltageInput] = useState<string>('11.5');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [currentStatus, setCurrentStatus] = useState<string>('unknown');
  const [originalVoltage, setOriginalVoltage] = useState<number | null>(null);
  const [saveLoading, setSaveLoading] = useState<{ 
    voltage: boolean; 
    devices: { [key: number]: boolean } 
  }>({ voltage: false, devices: {} });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Функция для получения ID текущего расчёта
  const getCurrentId = (): number | null => {
    if (id) {
      return parseInt(id);
    }
    
    if (currentCart?.current_id) {
      return currentCart.current_id;
    }
    if (currentCart?.id) {
      return currentCart.id;
    }
    
    return null;
  };

  // Функция для получения текущего напряжения
  const getCurrentVoltage = (): number => {
    const currentId = getCurrentId();
    
    if (currentId) {
      const savedVoltage = localStorage.getItem(`voltage_${currentId}`);
      if (savedVoltage) {
        return parseFloat(savedVoltage);
      }
    }
    
    if (id && currentDetail?.voltage_bord !== undefined) {
      if (currentId) {
        localStorage.setItem(`voltage_${currentId}`, currentDetail.voltage_bord.toString());
      }
      return currentDetail.voltage_bord;
    }
    
    if (currentCart?.voltage_bord !== undefined) {
      const currentId = getCurrentId();
      if (currentId) {
        localStorage.setItem(`voltage_${currentId}`, currentCart.voltage_bord.toString());
      }
      return currentCart.voltage_bord;
    }
    
    return 11.5;
  };

  // Функция для получения актуального статуса
  const getCalculationStatus = (): string => {
    if (currentDetail?.status) {
      return currentDetail.status;
    }
    if (currentCart?.status) {
      return currentCart.status;
    }
    return currentStatus;
  };

  // Функция для получения общей силы тока
  const getTotalAmperage = (): number | null => {
    if (id && currentDetail) {
      if (currentDetail.total_amperage !== undefined && currentDetail.total_amperage !== null) {
        return currentDetail.total_amperage;
      }
      
      if (currentDetail.amperage !== undefined && currentDetail.amperage !== null) {
        return currentDetail.amperage;
      }
      
      if (currentDetail.devices_with_amperage && Array.isArray(currentDetail.devices_with_amperage)) {
        const sum = currentDetail.devices_with_amperage.reduce((total: number, device: any) => {
          return total + (device.amperage || 0);
        }, 0);
        if (sum > 0) return sum;
      }
      
      if (currentDetail.currentDevices && Array.isArray(currentDetail.currentDevices)) {
        const sum = currentDetail.currentDevices.reduce((total: number, device: any) => {
          return total + (device.amperage || 0);
        }, 0);
        if (sum > 0) return sum;
      }
    }
    
    return null;
  };

  // Функция для получения списка устройств
  const getDevices = () => {
    const data = id ? currentDetail : currentCart;
    
    if (!data) return [];
    
    if (id && currentDetail) {
      const devices = currentDetail.devices || [];
      const currentDevices = currentDetail.currentDevices || currentDetail.current_devices || [];
      
      if (currentDevices.length > 0) {
        return devices.map((device: any) => {
          const currentDevice = currentDevices.find((cd: any) => 
            cd.device_id === device.device_id || cd.device_id === device.id
          );
          
          return {
            ...device,
            device_id: device.device_id || device.id,
            amount: currentDevice?.amount || device.amount || 1,
            amperage: currentDevice?.amperage || 0,
          };
        });
      }
    }
    
    const devices = data.devices || [];
    return devices.map((device: any) => ({
      ...device,
      device_id: device.device_id || device.id,
      amount: device.amount || 1,
      amperage: 0,
    }));
  };

  // Функция для обработки ошибок загрузки изображений
  const handleImageError = (deviceId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [deviceId]: true
    }));
  };

  // Функция для получения URL изображения
  const getImageUrl = (device: any) => {
    if (device.device_id && (imageErrors[device.device_id] || !device.image)) {
      return defaultDevice;
    }
    return device.image ? `http://localhost:9000/lab1/img/${device.image}` : defaultDevice;
  };

  // Функция для сохранения количества устройств через fetch - ИСПРАВЛЕННЫЙ ЭНДПОИНТ
  const handleSaveDeviceAmount = async (deviceId: number, amount: number) => {
    const currentId = getCurrentId();
    const status = getCalculationStatus();
    
    if (!currentId || status !== "draft") {
      showNotification('error', 'Только черновики можно редактировать');
      return;
    }
    
    if (amount < 1) {
      showNotification('error', 'Количество должно быть больше 0');
      return;
    }
    
    setSaveLoading(prev => ({
      ...prev,
      devices: { ...prev.devices, [deviceId]: true }
    }));

    try {
      // ИСПРАВЛЕННЫЙ ЭНДПОИНТ! Согласно Go коду: PUT /api/v1/current-devices/{current_id}/{device_id}
      const data = await fetchWithAuth(`/api/v1/current-devices/${currentId}/${deviceId}`, {
        method: "PUT",
        body: JSON.stringify({ amount })
      });
      
      showNotification('success', 'Количество сохранено!');
      
      // Обновляем данные через секунду
      setTimeout(() => {
        loadData();
      }, 500);
      
    } catch (error: any) {
      console.error('Ошибка сохранения количества:', error);
      showNotification('error', `Ошибка сохранения количества: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setSaveLoading(prev => ({
        ...prev,
        devices: { ...prev.devices, [deviceId]: false }
      }));
    }
  };

  // Функция для обновления напряжения бортовой сети через fetch
  const handleUpdateVoltage = async () => {
    const currentId = getCurrentId();
    const status = getCalculationStatus();
    
    if (!currentId) {
      showNotification('error', 'Заявка не найдена');
      return;
    }

    if (status !== "draft") {
      showNotification('error', 'Только черновики можно редактировать');
      return;
    }

    const voltageValue = parseFloat(voltageInput);
    if (isNaN(voltageValue)) {
      showNotification('error', 'Введите корректное значение напряжения');
      return;
    }

    if (voltageValue <= 0 || voltageValue > 48) {
      showNotification('error', 'Напряжение должно быть в диапазоне 0.1-48 В');
      return;
    }

    setSaveLoading(prev => ({ ...prev, voltage: true }));

    try {
      const result = await fetchWithAuth(`/api/v1/current-calculations/${currentId}/edit-current-calculations`, {
        method: 'PUT',
        body: JSON.stringify({ voltage_bord: voltageValue })
      });
      
      if (result) {
        // Сохраняем в localStorage для этой заявки
        localStorage.setItem(`voltage_${currentId}`, voltageValue.toString());
        
        // Сохраняем новое значение как оригинальное
        setOriginalVoltage(voltageValue);
        
        // Обновляем локальные данные
        if (id && currentDetail) {
          setCurrentDetail({
            ...currentDetail,
            voltage_bord: voltageValue
          });
        }
        if (!id && currentCart) {
          setCurrentCart({
            ...currentCart,
            voltage_bord: voltageValue
          });
        }
        
        showNotification('success', 'Напряжение сохранено!');
        
        // Обновляем данные через секунду
        setTimeout(() => {
          loadData();
        }, 500);
      }
      
    } catch (error: any) {
      console.error('Ошибка сохранения напряжения:', error);
      showNotification('error', error.message || 'Ошибка сохранения напряжения');
    } finally {
      setSaveLoading(prev => ({ ...prev, voltage: false }));
    }
  };

  // Функция для загрузки статуса заявки
  const loadCurrentStatus = async () => {
    if (!id) {
      setCurrentStatus('draft');
      return;
    }

    try {
      const calculations = await fetchWithAuth('/api/v1/current-calculations/current-calculations');
      
      const currentCalculation = calculations.find(
        (calc: any) => calc.current_id === parseInt(id) || calc.id === parseInt(id)
      );
      
      if (currentCalculation?.status) {
        setCurrentStatus(currentCalculation.status);
      } else {
        setCurrentStatus('draft');
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса:', error);
      setCurrentStatus('unknown');
    }
  };

  // Функция для загрузки данных
  const loadData = async () => {
    setLoading(true);
    try {
      if (id) {
        const data = await fetchWithAuth(`/api/v1/current-calculations/${id}`);
        setCurrentDetail(data);
        
        if (data?.voltage_bord !== undefined) {
          setVoltageInput(data.voltage_bord.toString());
        }
        
        await loadCurrentStatus();
      } else {
        const data = await fetchWithAuth('/api/v1/current-calculations/current-cart');
        setCurrentCart(data);
        setCurrentStatus('draft');
        
        if (data?.voltage_bord !== undefined) {
          setVoltageInput(data.voltage_bord.toString());
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      showNotification('error', 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Инициализация напряжения при загрузке данных
  useEffect(() => {
    const voltage = getCurrentVoltage();
    setVoltageInput(voltage.toString());
    setOriginalVoltage(voltage);
  }, [currentCart, currentDetail, id]);

  // Загрузка данных при монтировании
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    loadData();
  }, [isAuthenticated, navigate, id]);

  // Функция для открытия страницы устройства
  const handleOpenDevice = (deviceId: number) => {
    navigate(`/devices/${deviceId}`);
  };

  // Функция для удаления устройства из расчёта через fetch - ИСПРАВЛЕННЫЙ ЭНДПОИНТ
  const handleRemoveDevice = async (deviceId: number) => {
    const currentId = getCurrentId();
    const status = getCalculationStatus();
    
    if (!currentId || status !== "draft") {
      showNotification('error', 'Только черновики можно редактировать');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить устройство из расчёта?')) return;

    setSaveLoading(prev => ({
      ...prev,
      devices: { ...prev.devices, [deviceId]: true }
    }));

    try {
      // ИСПРАВЛЕННЫЙ ЭНДПОИНТ! Согласно Go коду: DELETE /api/v1/current-devices/{current_id}/{device_id}
      await fetchWithAuth(`/api/v1/current-devices/${currentId}/${deviceId}`, {
        method: "DELETE"
      });
      
      // Обновляем данные
      loadData();
      
      showNotification('success', 'Устройство удалено из расчёта!');
    } catch (err: any) {
      console.error('Ошибка удаления устройства', err);
      showNotification('error', 'Ошибка удаления устройства');
    } finally {
      setSaveLoading(prev => ({
        ...prev,
        devices: { ...prev.devices, [deviceId]: false }
      }));
    }
  };

  // Функция для удаления заявки через fetch
  const handleDeleteCalculation = async () => {
    const currentId = getCurrentId();
    const status = getCalculationStatus();
    
    if (!currentId || status !== "draft") {
      showNotification('error', 'Только черновики можно удалять');
      return;
    }
  
    if (!window.confirm('Вы уверены, что хотите удалить заявку?')) return;
  
    try {
      await fetchWithAuth(`/api/v1/current-calculations/${currentId}/delete-current-calculations`, {
        method: "DELETE"
      });
      
      showNotification('success', 'Заявка удалена!');
      setTimeout(() => navigate('/devices'), 1000);
    } catch (err: any) {
      console.error('Ошибка удаления заявки', err);
      showNotification('error', 'Ошибка удаления заявки');
    }
  };

  // Функция для подтверждения расчёта через fetch
  const handleFormCalculation = async () => {
    const currentId = getCurrentId();
    const status = getCalculationStatus();
    
    if (!currentId || status !== "draft") {
      showNotification('error', 'Только черновики можно подтверждать');
      return;
    }

    setSubmitLoading(true);
    try {
      const result = await fetchWithAuth(`/api/v1/current-calculations/${currentId}/form`, {
        method: "PUT"
      });
      
      if (result) {
        showNotification('success', 'Расчёт подтверждён!');
        
        // Обновляем статус
        setCurrentStatus('formed');
        
        setTimeout(() => {
          navigate('/currents');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Ошибка подтверждения расчёта', err);
      showNotification('error', 'Ошибка подтверждения расчёта');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Показываем загрузку
  if (loading) {
    return (
      <div className="current-calculation-page">
        <Header />
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  // Получаем данные для отображения
  const devices = getDevices();
  const hasDevices = devices.length > 0;
  const actualStatus = getCalculationStatus();
  const isDraft = actualStatus === "draft";
  const currentVoltage = getCurrentVoltage();
  const hasVoltageChanged = originalVoltage !== null && parseFloat(voltageInput) !== originalVoltage;
  const canEditVoltage = isDraft && !saveLoading.voltage;
  
  // Получаем общую силу тока
  const totalAmperage = getTotalAmperage();
  const showAmperage = !isDraft && totalAmperage !== null;

  // Проверяем наличие данных
  const hasData = (id && currentDetail) || (!id && currentCart);
  if (!hasData && !loading) {
    return (
      <div className="current-calculation-page">
        <Header />
        <div className="empty-cart">
          <p>Заявка не найдена</p>
          <button 
            className="btn-primary-back"
            onClick={() => navigate('/devices')}
          >
            Перейти к устройствам
          </button>
        </div>
      </div>
    );
  }

  // Функция для отображения статуса
  const getStatusDisplayText = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'Черновик',
      'formed': 'Сформирована',
      'completed': 'Завершена',
      'rejected': 'Отклонена',
      'finished': 'Завершена',
      'declined': 'Отклонена',
      'unknown': 'Неизвестно'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="current-calculation-page">
      <Header />
      
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.CURRENTS, path: '/currents' },
          { label: id ? `Расчёт №${id}` : ROUTE_LABELS.CURRENT },
        ]}
      />
      
      <main>
        <div className="current-header">
          <h1>
            {id ? `Расчёт №${id}` : `Моя корзина`}
          </h1>
          
          <p>
            Всего устройств: {devices.length}
          </p>
          <p>Статус: <strong className={`status-${actualStatus}`}>{getStatusDisplayText(actualStatus)}</strong></p>
        </div>

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* Секция напряжения бортовой сети и силы тока */}
        <div className="voltage-amperage-section">
          <div className="voltage-amperage-single-line">
            <div className="voltage-control-group">
              <label htmlFor="voltage-input" className="voltage-label">
                Напряжение бортовой сети:
              </label>
              <div className="voltage-input-group">
                <div className="voltage-input-wrapper">
                  <input
                    id="voltage-input"
                    type="number"
                    className="voltage-input"
                    value={voltageInput}
                    onChange={(e) => setVoltageInput(e.target.value)}
                    step="0.1"
                    min="0.1"
                    max="48"
                    disabled={!isDraft || saveLoading.voltage}
                    placeholder="В"
                  />
                  <span className="voltage-unit">В</span>
                </div>
                
                {isDraft ? (
                  <div className="voltage-actions">
                    <button
                      className="btn-save-voltage"
                      onClick={handleUpdateVoltage}
                      disabled={!canEditVoltage || !hasVoltageChanged}
                    >
                      {saveLoading.voltage ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    {hasVoltageChanged && (
                      <span className="voltage-hint">
                        Нажмите "Сохранить" для применения
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="amperage-control-group">
              <label className="amperage-label">
                Необходимая сила тока:
              </label>
              <div className="amperage-display">
                {showAmperage ? (
                  <span className="amperage-value">
                    <strong>{totalAmperage?.toFixed(2)} А</strong>
                  </span>
                ) : (
                  <span className="amperage-empty">—</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Заголовок таблицы устройств */}
        <div className="current-devices-table-header">
          <span className="image-header"></span>
          <span className="device-title-header">Устройство</span>
          <span className="device-power-header">Мощность устройства</span>
          <span className="amount-header">Количество</span>
          <span className="amperage-header">Необходимая сила тока</span>
          {isDraft && <span className="actions-header">Действия</span>}
        </div>

        {/* Список устройств */}
        {hasDevices ? (
          <ul className="current-devices-list">
            {devices.map((device: any) => (
              <CurrentDeviceRow 
                key={device.device_id}
                device={device}
                onOpenDevice={handleOpenDevice}
                onRemoveDevice={handleRemoveDevice}
                onSaveDeviceAmount={handleSaveDeviceAmount}
                saveLoading={saveLoading}
                getImageUrl={getImageUrl}
                handleImageError={handleImageError}
                isDraft={isDraft}
              />
            ))}
          </ul>
        ) : (
          <div className="no-devices">
            <p>Устройства отсутствуют</p>
            <button 
              className="btn-primary-back"
              onClick={() => navigate('/devices')}
            >
              Добавить устройства
            </button>
          </div>
        )}

        {/* Действия с заявкой */}
        <div className="calculation-actions">
          {isDraft ? (
            <>
              <button 
                className="btn-primary-danger" 
                onClick={handleDeleteCalculation}
                disabled={submitLoading || saveLoading.voltage}
              >
                Удалить заявку
              </button>
              
              <button 
                className="btn-confirm-calculation" 
                onClick={handleFormCalculation}
                disabled={submitLoading || saveLoading.voltage || !hasDevices}
              >
                {submitLoading ? 'Подтверждение...' : 'Сформировать расчёт'}
              </button>
            </>
          ) : (
            null
          )}
        </div>
      </main>
    </div>
  );
}

// Компонент строки устройства
function CurrentDeviceRow({ 
  device, 
  onOpenDevice, 
  onRemoveDevice,
  onSaveDeviceAmount,
  saveLoading,
  getImageUrl,
  handleImageError,
  isDraft = false,
}: any) {
  const [localDeviceAmount, setLocalDeviceAmount] = useState(device.amount || 1);

  useEffect(() => {
    setLocalDeviceAmount(device.amount || 1);
  }, [device.amount]);

  const handleAmountChange = (value: number) => {
    if (!isDraft) return;
    setLocalDeviceAmount(value);
  };

  const handleIncrement = () => {
    if (!isDraft) return;
    const newAmount = parseInt(localDeviceAmount.toString()) + 1;
    setLocalDeviceAmount(newAmount);
  };

  const handleDecrement = () => {
    if (!isDraft) return;
    const newAmount = Math.max(1, parseInt(localDeviceAmount.toString()) - 1);
    setLocalDeviceAmount(newAmount);
  };

  const handleSave = () => {
    if (!isDraft) return;
    const amountValue = parseInt(localDeviceAmount.toString());
    if (!isNaN(amountValue) && amountValue >= 1) {
      onSaveDeviceAmount(device.device_id, amountValue);
    }
  };

  return (
    <li className="current-device-item">
      <div className="device-image-container">
        <img 
          src={getImageUrl(device)}
          alt={device.name}
          onError={() => handleImageError(device.device_id)}
          className="device-image"
        />
      </div>
      
      <div className="device-info">
        <span 
          className="device-name" 
          onClick={() => onOpenDevice(device.device_id)}
          style={{ cursor: 'pointer', color: '#0066cc' }}
        >
          {device.name || `Устройство ${device.device_id}`}
        </span>
      </div>

      <span className="device-power">{device.power_nominal} Вт</span>
      
      <div className="amount-controls">
        {isDraft ? (
          <div className="quantity-controls-wrapper">
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={handleDecrement}
                disabled={saveLoading.devices?.[device.device_id]}
              >
                -
              </button>
              <input 
                type="number" 
                className="quantity-input"
                value={localDeviceAmount}
                onChange={(e) => handleAmountChange(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                disabled={saveLoading.devices?.[device.device_id]}
              />
              <button 
                className="quantity-btn"
                onClick={handleIncrement}
                disabled={saveLoading.devices?.[device.device_id]}
              >
                +
              </button>
            </div>
            {saveLoading.devices?.[device.device_id] && (
              <div className="saving-indicator">Сохранение...</div>
            )}
          </div>
        ) : (
          <span className="device-amount-readonly">{device.amount || 1}</span>
        )}
      </div>

      <span className="device-amperage">
        <strong>{device.amperage && device.amperage > 0 ? `${device.amperage.toFixed(2)} А` : '—'}</strong>
      </span>

      {isDraft && (
        <div className="device-actions-wrapper">
          <button 
            className="btn-save-amount"
            onClick={handleSave}
            disabled={saveLoading.devices?.[device.device_id] || localDeviceAmount < 1}
          >
            {saveLoading.devices?.[device.device_id] ? '...' : 'Сохранить'}
          </button>
          
          <button 
            className="btn-remove-device"
            onClick={() => onRemoveDevice(device.device_id)}
            title="Удалить устройство из расчёта"
            disabled={saveLoading.devices?.[device.device_id]}
          >
            Х
          </button>
        </div>
      )}
    </li>
  );
}