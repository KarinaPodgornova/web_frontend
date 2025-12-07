// modules/CurrentDevicesApi.ts

// Функция добавления устройства в расчет
export async function addDeviceToCurrent(deviceId: number): Promise<any> {
    try {
      console.log(`Adding device ${deviceId} to current...`);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        "Accept": "application/json",
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/v1/devices/${deviceId}/add-to-current-calculation`, {
        method: "POST",
        headers
      });
      
      console.log(`Response status: ${res.status}`);
      
      if (!res.ok) {
        if (res.status === 409) {
          console.log('Device already in current calculation');
          return { message: 'already_added' };
        }
        console.error(`HTTP error! status: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Device added to current:', data);
      return data;
    } catch (err) {
      console.error(`Failed to add device to current:`, err);
      return null;
    }
  }

  // Обновить устройство в расчете
export async function updateCurrentDevice(deviceId: number, currentId: number, data: { amount: number }): Promise<any | null> {
    try {
      console.log(`Updating device ${deviceId} in current ${currentId}:`, data);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        "Accept": "application/json",
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/v1/current-devices/${currentId}/${deviceId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data)
      });
      
      console.log(`Response status: ${res.status}`);
      
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      }
      
      const responseData = await res.json();
      console.log('Device updated in current:', responseData);
      return responseData;
    } catch (err) {
      console.error(`Failed to update device in current:`, err);
      return null;
    }
  }
  
  // Удалить устройство из расчета
  export async function deleteCurrentDevice(deviceId: number, currentId: number): Promise<boolean> {
    try {
      console.log(`Deleting device ${deviceId} from current ${currentId}...`);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        "Accept": "application/json",
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/v1/current-devices/${currentId}/${deviceId}`, {
        method: "DELETE",
        headers
      });
      
      console.log(`Response status: ${res.status}`);
      
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      }
      
      console.log('Device deleted from current successfully');
      return true;
    } catch (err) {
      console.error(`Failed to delete device from current:`, err);
      return false;
    }
  }


  