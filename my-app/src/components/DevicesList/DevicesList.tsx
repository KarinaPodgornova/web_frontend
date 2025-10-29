// components/DevicesList/DevicesList.tsx
import './DevicesList.css';
import DeviceCard from '../DeviceCard/DeviceCard';
import { type Device } from '../../modules/DevicesTypes';

export default function DevicesList({ devices }: {devices: Device[]}) {
  return (
    <>
      {devices.map((device) => (
        <DeviceCard key={device.device_id} device={device} />  
      ))}
    </>
  );
}