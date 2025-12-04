// src/pages/CurrentCalculationPage/CurrentCalculationPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
//import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  getCurrentCart, 
  getCurrentDetail,
  removeFromCurrentCalculation, 
  formCurrentCalculation,
  updateDeviceAmount, 
  deleteCurrentCalculation
} from '../../store/slices/currentCalculationSlice';
import './CurrentCalculationPage.css';
import defaultDevice from '../../assets/DefaultImage.jpg';


export default function CurrentCalculationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  

  const { isAuthenticated } = useAppSelector(state => state.user);
  const { currentCart, currentDetail, devices_count, loading, saveLoading } = useAppSelector(state => state.currentCalculation);

  const isViewingCalculation = !!id;

  const [submitLoading, setSubmitLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const getDevices = () => {
    const data = id ? currentDetail : currentCart;
    return data?.devices || [];
  };

  const getCurrentCalculationData = () => {
    return currentDetail || currentCart;
  };

  const handleImageError = (deviceId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [deviceId]: true
    }));
  };

  const getImageUrl = (device: any) => {
    if (imageErrors[device.device_id] || !device.image) {
      return defaultDevice;
    }
    return `http://localhost:9000/lab1/img/${device.image}`;
  };

  const handleSaveDeviceAmount = async (deviceId: number, amount: number) => {
    if (!currentCart?.id) return;
    
    if (amount < 1) {
      showNotification('error', 'Количество должно быть больше 0');
      return;
    }
    
    try {
      await dispatch(updateDeviceAmount({
        deviceId,
        currentId: currentCart.id,
        amount: amount
      })).unwrap();
      
      showNotification('success', 'Количество сохранено!');
      dispatch(getCurrentCart());
      if (currentCart.id) {
        dispatch(getCurrentDetail(currentCart.id));
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка сохранения количества: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

 // ЗАМЕНИТЕ весь useEffect на этот:
useEffect(() => {
  if (!isAuthenticated) {
    navigate('/signin');
    return;
  }

  const loadData = async () => {
    try {
      if (id) {
        // ЕСТЬ ID в URL - загружаем конкретную заявку
        console.log('Загружаем заявку ID:', id);
        await dispatch(getCurrentDetail(parseInt(id)));
      } else {
        // НЕТ ID в URL - загружаем корзину (черновик)
        console.log('Загружаем корзину (черновик)');
        const cartResult = await dispatch(getCurrentCart()).unwrap();
        
        if (cartResult.current_id || cartResult.id) {
          const currentId = cartResult.current_id || cartResult.id;
          await dispatch(getCurrentDetail(currentId));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  loadData();
}, [isAuthenticated, dispatch, navigate, id]); // ← ДОБАВЬТЕ id в зависимости

  const handleOpenDevice = (deviceId: number) => {
    navigate(`/devices/${deviceId}`);
  };

  const handleRemoveDevice = async (deviceId: number) => {
    if (!currentCart?.id) return;

    if (!window.confirm('Вы уверены, что хотите удалить устройство из расчёта?')) return;

    try {
      await dispatch(removeFromCurrentCalculation({ 
        deviceId, 
        currentId: currentCart.id 
      })).unwrap();
      
      dispatch(getCurrentCart());
      if (currentCart.id) {
        dispatch(getCurrentDetail(currentCart.id));
      }
      
      showNotification('success', 'Устройство удалено из расчёта!');
    } catch (err) {
      console.error('Ошибка удаления устройства', err);
      showNotification('error', 'Ошибка удаления устройства');
    }
  };


  const handleDeleteCalculation = async () => {
    if (!currentCart?.id) return;
  
    if (!window.confirm('Вы уверены, что хотите удалить заявку?')) return;
  
    try {
      await dispatch(deleteCurrentCalculation(currentCart.id)).unwrap();
      showNotification('success', 'Заявка удалена!');
      setTimeout(() => navigate('/devices'), 1000);
    } catch (err) {
      console.error('Ошибка удаления заявки', err);
      showNotification('error', 'Ошибка удаления заявки');
    }
  };


  const handleFormCalculation = async () => {
    if (!currentCart?.id) return;

    setSubmitLoading(true);
    try {
      await dispatch(formCurrentCalculation(currentCart.id)).unwrap();
      showNotification('success', 'Расчёт подтверждён!');
      
      setTimeout(() => {
        navigate('/devices');
      }, 2000);
    } catch (err) {
      console.error('Ошибка подтверждения расчёта', err);
      showNotification('error', 'Ошибка подтверждения расчёта');
    } finally {
      setSubmitLoading(false);
    }
  };




  
  if (loading) {
    return (
      <div className="current-calculation-page">
        <Header />
        <div className="loading">Загрузка корзины...</div>
      </div>
    );
  }

  if (!currentCart) {
    return (
      <div className="current-calculation-page">
        <Header />
        <div className="empty-cart">
          <p>Корзина пуста</p>
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

  const currentCalculationData = getCurrentCalculationData();
  const devices = getDevices();
  const hasDevices = devices.length > 0;

  return (
    <div className="current-calculation-page">
      <Header />
      
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.DEVICES, path: '/devices' },
          { label: ROUTE_LABELS.CURRENT },
        ]}
      />
      
      <main>
      <div className="current-header">
  <h1>
    {id ? `Расчёт №${id}` : `Моя корзина`}
  </h1>
  <p>
    Всего устройств: {
      id 
        ? (currentDetail?.devices || []).length 
        : (currentCart?.devices || []).length
    }
  </p>
</div>


        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="current-devices-table-header">
          <span className="image-header"></span> {/* Добавь эту пустую ячейку */}
          <span className="device-title-header">Устройство</span>
          <span className="device-power-header">Мощность устройства</span>
          <span className="amount-header">Количество</span>
          <span className="actions-header">Удаление</span>
        </div>

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

<div className="calculation-actions">
  
  
  <button 
    className="btn-confirm-calculation" 
    onClick={handleFormCalculation}
    disabled={submitLoading || !hasDevices}
  >
    {submitLoading ? 'Подтверждение...' : 'Сформировать расчёт'}
  </button>
</div>
      </main>
    </div>
  );
}

function CurrentDeviceRow({ 
  device, 
  onOpenDevice, 
  onRemoveDevice,
  onSaveDeviceAmount,
  saveLoading,
  getImageUrl,
  handleImageError,
  isDraft, 
}: any) {
  const [localDeviceAmount, setLocalDeviceAmount] = useState(device.amount || 1);

  const handleAmountChange = (value: number) => {
    setLocalDeviceAmount(value);
  };

  const handleSave = () => {
    const amountValue = parseInt(localDeviceAmount);
    if (!isNaN(amountValue)) {
      onSaveDeviceAmount(device.device_id, amountValue);
    }
  };

  const handleIncrement = () => {
    const newAmount = parseInt(localDeviceAmount) + 1;
    setLocalDeviceAmount(newAmount);
    onSaveDeviceAmount(device.device_id, newAmount);
  };

  const handleDecrement = () => {
    const newAmount = Math.max(1, parseInt(localDeviceAmount) - 1);
    setLocalDeviceAmount(newAmount);
    onSaveDeviceAmount(device.device_id, newAmount);
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
        >
          {device.name || `Устройство ${device.device_id}`}
        </span>
      </div>

      <span className="device-power">{device.power_nominal} Вт</span>
      
      <div className="amount-controls">
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
          <div className="saving-indicator">...</div>
        )}
      </div>

      <div className="device-actions">
      <button 
  className="btn-remove-device"
  onClick={() => onRemoveDevice(device.device_id)}
  title="Удалить устройство из расчёта"
  disabled={saveLoading.devices?.[device.device_id]}
>
  Х
</button>
      </div>
    </li>
  );
}