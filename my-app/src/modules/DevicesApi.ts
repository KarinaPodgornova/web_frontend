// modules/DevicesApi.ts
import type { Device } from "./DevicesTypes";

export async function listDevices(params?: { device_query?: string }): Promise<Device[]> {
  try {
    let path = "/api/v1/devices";
    if (params?.device_query) {
      const query = new URLSearchParams();
      query.append("device_query", params.device_query);
      path += `?${query.toString()}`;
    }

    const res = await fetch(path, { 
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json"
      } 
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch devices:", err);
    // Возвращаем mock данные при ошибке
    return [];
  }
}

export async function getDevice(id: number): Promise<Device | null> {
  try {
    const res = await fetch(`/api/v1/device/${id}`, { 
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json"
      } 
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch device ${id}:`, err);
    return null;
  }
}

export async function getCartInfo(): Promise<{ cartId: number; cartCount: number }> {
  try {
    const res = await fetch("/api/v1/cart/info", { 
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json"
      } 
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch cart info:", err);
    return { cartId: 0, cartCount: 0 };
  }
}