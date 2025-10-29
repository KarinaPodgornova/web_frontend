// components/DevicesList/DevicesList.tsx
import './DevicesList.css';
import DeviceCard from '../DeviceCard/DeviceCard';
import { type Device } from '../../modules/DevicesTypes';

export default function DevicesList({ devices }: {devices: Device[]}) {
  return (
    <>
      {devices.map((s) => (
        <DeviceCard key={s.id} device={s} />  
      ))}
    </>
  );
}