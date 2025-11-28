// components/DeviceCard/DeviceCard.tsx
import { Link } from "react-router-dom";
import type { Device } from "../../modules/DevicesTypes";
import "./DeviceCard.css";

import { useState, useEffect } from "react";
import defaultDeviceImage from "../../assets/DefaultImage.jpg";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addToCurrentCalculation } from "../../store/slices/currentCalculationSlice";

export default function DeviceCard({ device }: { device: Device }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const { loading } = useAppSelector((state) => state.currentCalculation);

  const [imageError, setImageError] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

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

  const handleImageError = () => {
    setImageError(true);
    setImageUrl(defaultDeviceImage);
  };

  // ---- Добавление устройства ----
  const handleAdd = async () => {
    if (!isAuthenticated) {
      alert("Авторизуйтесь, чтобы добавить в расчёт");
      return;
    }

    setAddLoading(true);
    setAddError("");

    try {
      await dispatch(addToCurrentCalculation(device.device_id)).unwrap();
      console.log("Добавлено в расчёт");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setAddError("Устройство уже добавлено");
      } else {
        setAddError("Ошибка добавления");
      }
    } finally {
      setAddLoading(false);
    }
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
        <div className="product-description">
          Мощность: {device.power_nominal} Вт
        </div>

        <Link to={`/devices/${device.device_id}`} className="add-to-cart">
          Подробнее
        </Link>

        <button
          onClick={handleAdd}
          disabled={addLoading || loading}
          className="add-to-cart"
          style={{ marginTop: "10px" }}
        >
          {addLoading ? "Добавление..." : "Добавить в расчёт"}
        </button>

        {addError && <p className="error-message">{addError}</p>}
      </div>
    </div>
  );
}
