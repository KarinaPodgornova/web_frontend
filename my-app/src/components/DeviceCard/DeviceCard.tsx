// components/DeviceCard/DeviceCard.tsx
import { Link } from "react-router-dom";
import type { Device } from "../../modules/DevicesTypes";
import './DeviceCard.css';
import { useState, useEffect } from 'react';
import defaultDeviceImage from '../../assets/DefaultImage.jpg';

export default function DeviceCard({ device }: { device: Device }) {
    const [imageError, setImageError] = useState(false);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    
    const getImageUrl = (filename: string) => {
        if (!filename) return defaultDeviceImage;
        return `http://localhost:9000/lab1/img/${filename}`;
    };

    const [imageUrl, setImageUrl] = useState(getImageUrl(device.image));

    useEffect(() => {
        if (!device.image) {
            setImageUrl(defaultDeviceImage);
        } else {
            setImageUrl(getImageUrl(device.image));
        }
    }, [device.image]);

    // Функция добавления в корзину через fetch
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Проверяем авторизацию
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setError('Войдите в систему, чтобы добавить устройство');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setAdding(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:8000/api/current/devices/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
                },
                body: JSON.stringify({
                    device_id: device.device_id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка добавления');
            }

            const result = await response.json();
            
            if (result.message === 'already_added') {
                setSuccess('Устройство уже в расчете');
            } else {
                setSuccess('Добавлено в расчет!');
            }
            
            setTimeout(() => setSuccess(''), 3000);
            
            // Обновляем счетчик корзины
            window.dispatchEvent(new Event('cart-updated'));
            
        } catch (err: any) {
            setError(err.message || 'Ошибка добавления');
            setTimeout(() => setError(''), 3000);
        } finally {
            setAdding(false);
        }
    };

    const handleImageError = () => {
        setImageError(true);
        setImageUrl(defaultDeviceImage);
    };

    return (
        <div className="product">
            <div className="product-image">
                <img 
                    src={imageError ? defaultDeviceImage : imageUrl}
                    alt={device.name}
                    onError={handleImageError}
                />
            </div>
            <div className="product-content">
                <div className="product-title">{device.name}</div>
                <div className="product-description">Мощность: {device.power_nominal} Вт</div>
               
                {/* Сообщения */}
                {error && (
                    <div style={{
                        backgroundColor: '#ffeaea',
                        color: '#d63031',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        marginBottom: '10px',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}
                
                {success && (
                    <div style={{
                        backgroundColor: '#eaffea',
                        color: '#27ae60',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        marginBottom: '10px',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {success}
                    </div>
                )}
                
            
                <Link 
                    to={`/devices/${device.device_id}`} 
                    className="add-to-cart"
                >
                    Подробнее
                </Link>
                
         
                <button 
                    className="add-to-cart"
                    onClick={handleAddToCart}
                    disabled={adding}
                    style={{
                        backgroundColor: adding ? '#cccccc' : '#1854CD',
                        cursor: adding ? 'not-allowed' : 'pointer',
                        marginTop: '8px'
                    }}
                >
                    {adding ? 'Добавление...' : 'Добавить в расчет'}
                </button>
            </div>
        </div>
    );
}