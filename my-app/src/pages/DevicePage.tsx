// pages/DevicePage/DevicePage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BreadCrumbs } from '../components/BreadCrumbs/BreadCrumbs';
import { ROUTES, ROUTE_LABELS } from '../Routes';
import { getDevice } from '../modules/DevicesApi';
import type { Device } from '../modules/DevicesTypes';
import { Spinner } from 'react-bootstrap';
import Header from '../components/Header/Header';
import { DEVICES_MOCK } from '../modules/mock';
import './DevicePage.css';
import defaultDeviceImage from '../assets/DefaultImage.jpg';

export default function DevicePage() {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    
    const fetchDevice = async () => {
      try {
        setLoading(true);
        const deviceData = await getDevice(Number(id));
        
        // Если API вернуло null (ошибка), используем моки
        if (!deviceData) {
          const mockDevice = DEVICES_MOCK.find(d => d.device_id === Number(id)) || null;
          setDevice(mockDevice);
        } else {
          setDevice(deviceData);
        }
      } catch (error) {
        console.error('Error fetching device, using mocks:', error);
        // При ошибке используем моки
        const mockDevice = DEVICES_MOCK.find(d => d.device_id === Number(id)) || null;
        setDevice(mockDevice);
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
  }, [id]);


  const getImageUrl = (filename: string) => {
    if (!filename || imageError) return defaultDeviceImage;
    return `http://localhost:9000/lab1/img/${filename}`;
};

  const handleImageError = () => {
    setImageError(true);
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
        </div>
      </div>
    );
  }

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
              {device.in_stock ? 'В наличии' : 'Нет в наличии'}
            </div>
            <div className="device-product-power">Мощность: {device.power_nominal} Вт</div>
            
            <div className="device-specifications">
              <div>Тип: {device.type}</div>
              <div>Напряжение: {device.voltage_nominal} В</div>
              <div>Сопротивление: {device.resistance} Ом</div>
              <div>Коэффициент запаса: {device.coeff_reserve}</div>
              <div>КПД: {(device.coeff_efficiency * 100).toFixed(1)}%</div>
            </div>
            
            <div className="device-divider"></div>
            
          </div>
        </div>
        
        <div className="device-description">
          <h2>Описание</h2>
          <div className="device-divider"></div>  
          <p style={{fontWeight: '300', color: '#000'}}>{device.description}</p>
        </div>
      </div>
    </div>
  );
}