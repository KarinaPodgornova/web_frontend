// components/DeviceCard/DeviceCard.tsx
import { Link } from "react-router-dom";
import type { Device } from "../../modules/DevicesTypes";
import './DeviceCard.css';
import { useState, useEffect } from 'react';
import defaultDeviceImage from '../../assets/DefaultImage.jpg';
import { dest_img } from '../../modules/target_config';

export default function DeviceCard({ device }: { device: Device }) {
    const [imageError, setImageError] = useState(false);
    
    const getImageUrl = (filename: string) => {
        if (!filename) return defaultDeviceImage;
        return `${dest_img}/${filename}`;
    };

    const [imageUrl, setImageUrl] = useState(getImageUrl(device.image));

    useEffect(() => {
        if (!device.image) {
            setImageUrl(defaultDeviceImage);
        } else {
            setImageUrl(getImageUrl(device.image));
        }
    }, [device.image]);

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
               
                <Link to={`/devices/${device.device_id}`} className="add-to-cart">
                    Подробнее
                </Link>
            </div>
        </div>
    );
}