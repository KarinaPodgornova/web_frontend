// src/pages/DevicePage/DevicePage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTES, ROUTE_LABELS } from '../../Routes';
import { getDevice } from '../../modules/DevicesApi';
import type { Device } from '../../modules/DevicesTypes';
import { addDeviceToCurrent } from '../../modules/CurrentDevicesApi';
import { getCurrentCart } from '../../modules/CurrentApi';
import { Spinner } from 'react-bootstrap';
import Header from '../../components/Header/Header';
import { DEVICES_MOCK } from '../../modules/mock';
import './DevicePage.css';
import defaultDeviceImage from '../../assets/DefaultImage.jpg';

export default function DevicePage() {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [currentCart, setCurrentCart] = useState<any>(null);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Проверка авторизации через localStorage
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  // Функция загрузки корзины через fetch
  const loadCurrentCart = async () => {
    if (!isAuthenticated()) return;
    
    try {
      const cartData = await getCurrentCart(); // Прямой вызов из модуля
      if (cartData) {
        setCurrentCart(cartData);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  // Показать уведомление
  const showNotification = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccessMessage(message);
      setError('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setError(message);
      setSuccessMessage('');
      setTimeout(() => setError(''), 3000);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate('/devices');
      return;
    }
    
    const fetchDevice = async () => {
      try {
        setLoading(true);
        const deviceData = await getDevice(Number(id));
        
        if (!deviceData) {
          const mockDevice = DEVICES_MOCK.find(d => d.device_id === Number(id)) || null;
          setDevice(mockDevice);
        } else {
          setDevice(deviceData);
        }
      } catch (error) {
        console.error('Error fetching device, using mocks:', error);
        const mockDevice = DEVICES_MOCK.find(d => d.device_id === Number(id)) || null;
        setDevice(mockDevice);
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
    
    // Загружаем корзину при загрузке страницы
    if (isAuthenticated()) {
      loadCurrentCart();
    }
  }, [id, navigate]);

  const getImageUrl = (filename: string) => {
    if (!filename || imageError) return defaultDeviceImage;
    return `http://localhost:9000/lab1/img/${filename}`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Функция добавления устройства в расчет
  const handleAddToCurrent = async () => {
    if (!isAuthenticated()) {
      showNotification('error', 'Войдите в систему, чтобы добавить устройство в расчет');
      navigate('/signin');
      return;
    }

    if (!device) {
      showNotification('error', 'Устройство не найдено');
      return;
    }

    setAddingToCart(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await addDeviceToCurrent(device.device_id);
      
      if (result?.message === 'already_added') {
        showNotification('success', 'Устройство уже добавлено в расчет');
      } else {
        showNotification('success', 'Устройство добавлено в расчет!');
      }
      
      // Обновляем корзину после добавления
      await loadCurrentCart();
      
      // Предлагаем перейти к расчету через 1.5 секунды
      setTimeout(() => {
        if (currentCart?.id || currentCart?.current_id) {
          const cartId = currentCart.current_id || currentCart.id;
          if (cartId) {
            navigate(`/current/${cartId}`);
          }
        }
      }, 1500);
      
    } catch (err: any) {
      console.error('Ошибка добавления устройства:', err);
      showNotification('error', err.message || 'Ошибка добавления устройства в расчет');
    } finally {
      setAddingToCart(false);
    }
  };

  // Функция перехода к расчету
  const handleGoToCurrent = () => {
    const cartId = currentCart?.current_id || currentCart?.id;
    
    if (cartId) {
      navigate(`/current/${cartId}`);
    } else {
      showNotification('error', 'Сначала добавьте устройства в расчет');
    }
  };

  if (loading) {
    return (
      <div className="device-page">
        <Header />
        <div className="device-page-loader">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="device-page">
        <Header />
        <div className="device-not-found">
          <h1>Устройство не найдено</h1>
          <button 
            className="btn-primary"
            onClick={() => navigate('/devices')}
          >
            Вернуться к списку устройств
          </button>
        </div>
      </div>
    );
  }

  // Расчет силы тока для устройства
  const calculateCurrent = () => {
    if (!device.power_nominal || !device.voltage_nominal) return '0';
    return (device.power_nominal / device.voltage_nominal).toFixed(2);
  };

  return (
    <div className="device-page">
      <Header />
      
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.DEVICES, path: ROUTES.DEVICES },
          { label: device.name },
        ]}
      />

      <div className="device-footer-spacer"></div>
      
      {error && (
        <div className="notification-error">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="notification-success">
          {successMessage}
        </div>
      )}
      
      <div className="device-detail-container">
        <div className="device-product-detail-container">
          <div className="device-product-image-section">
            <div className="device-img-container">
              <img 
                src={getImageUrl(device.image)} 
                alt={device.name}
                className="device-product-image-large"
                onError={handleImageError}
              />
            </div>
          </div>
          
          <div className="device-product-info-section">
            <h1 className="device-product-title">{device.name}</h1>
            
            <div className="device-divider"></div>
            
            <div className="device-availability">
              <span className={`availability-indicator ${device.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                {device.in_stock ? 'В наличии' : 'Нет в наличии'}
              </span>
            </div>
            
            <div className="device-product-specs">
              <div className="spec-item">
                <span className="spec-label">Мощность:</span>
                <span className="spec-value">{device.power_nominal} Вт</span>
              </div>
              
              <div className="spec-item">
                <span className="spec-label">Тип:</span>
                <span className="spec-value">{device.type}</span>
              </div>
              
              <div className="spec-item">
                <span className="spec-label">Напряжение:</span>
                <span className="spec-value">{device.voltage_nominal} В</span>
              </div>
              
              <div className="spec-item">
                <span className="spec-label">Сила тока:</span>
                <span className="spec-value">{calculateCurrent()} А</span>
              </div>
              
              <div className="spec-item">
                <span className="spec-label">Сопротивление:</span>
                <span className="spec-value">{device.resistance} Ом</span>
              </div>
              
              <div className="spec-item">
                <span className="spec-label">Коэффициент запаса:</span>
                <span className="spec-value">{device.coeff_reserve}</span>
              </div>
              
              <div className="spec-item">
                <span className="spec-label">КПД:</span>
                <span className="spec-value">{(device.coeff_efficiency * 100).toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="device-divider"></div>
            
            <div className="device-actions">
             
              
            
            </div>
          </div>
        </div>
        
        <div className="device-description">
          <h2>Описание</h2>
          <div className="device-divider"></div>  
          <p className="device-description-text">{device.description}</p>
        </div>
      </div>
    </div>
  );
}