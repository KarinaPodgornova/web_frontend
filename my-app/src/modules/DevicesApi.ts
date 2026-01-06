// modules/DevicesApi.ts
import type { Device } from "./DevicesTypes";
import { dest_api } from "./target_config";

export async function listDevices(params?: { device_query?: string }): Promise<Device[]> {
  try {
    let path = "/api/v1/devices";
    if (params?.device_query) {
      const query = new URLSearchParams();
      query.append("name", params.device_query);
      path += `?${query.toString()}`;
    }

    console.log('Fetching devices from:', path); // Отладка
    
    const res = await fetch(path, { 
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json"
      } 
    });
    
    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`);
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Devices data received:', data); // Отладка
    return data;
  } catch (err) {
    console.error("Failed to fetch devices:", err);
    return [];
  }
}

export async function getDevice(id: number): Promise<Device | null> {
  try {
    console.log(`Fetching device ${id} from API...`);
    const res = await fetch(`${dest_api}/devices/${id}`, {
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json"
      } 
    });
    
    console.log(`Response status: ${res.status}`);
    
    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`);
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Device data received:', data);
    return data;
  } catch (err) {
    console.error(`Failed to fetch device ${id}:`, err);
    return null;
  }
}