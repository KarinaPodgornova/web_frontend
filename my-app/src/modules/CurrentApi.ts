// modules/CurrentApi.ts
import type { CurrentCalculation, CurrentCart } from "./CurrentTypes";

// Получить список всех расчетов
export async function listCurrentCalculations(filters?: {
  'from-date'?: string;
  'to-date'?: string;
  status?: string;
}): Promise<CurrentCalculation[]> {
  try {
    let path = "/api/v1/current-calculations/current-calculations";
    
    if (filters) {
      const query = new URLSearchParams();
      if (filters['from-date']) query.append('from-date', filters['from-date']);
      if (filters['to-date']) query.append('to-date', filters['to-date']);
      if (filters.status) query.append('status', filters.status);
      
      const queryString = query.toString();
      if (queryString) {
        path += `?${queryString}`;
      }
    }
    
    console.log('Fetching current calculations from:', path);
    
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      "Accept": "application/json",
      "Content-Type": "application/json"
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(path, { 
      headers
    });
    
    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`);
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Current calculations data received:', data);
    return data;
  } catch (err) {
    console.error("Failed to fetch current calculations:", err);
    return [];
  }
}

// Получить корзину
export async function getCurrentCart(): Promise<CurrentCart | null> {
  try {
    console.log('Fetching current cart from API...');
    
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      "Accept": "application/json",
      "Content-Type": "application/json"
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch("/api/v1/current-calculations/current-cart", {
      headers
    });
    
    console.log(`Response status: ${res.status}`);
    
    if (res.status === 404) {
      console.log('Cart not found (probably empty)');
      return null;
    }
    
    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`);
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Current cart data received:', data);
    
    if (data && !data.status) {
      data.status = 'draft';
    }
    
    return data;
  } catch (err) {
    console.error('Failed to fetch current cart:', err);
    return null;
  }
}

// Получить расчет по ID
export async function getCurrentCalculation(id: number): Promise<any | null> {
  try {
    console.log(`Fetching current calculation ${id} from API...`);
    
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      "Accept": "application/json",
      "Content-Type": "application/json"
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(`/api/v1/current-calculations/${id}`, {
      headers
    });
    
    console.log(`Response status: ${res.status}`);
    
    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`);
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Current calculation data received:', data);
    return data;
  } catch (err) {
    console.error(`Failed to fetch current calculation ${id}:`, err);
    return null;
  }
}

// Обновить расчет
export async function updateCurrentCalculation(id: number, data: { voltage_bord?: number }): Promise<any | null> {
    try {
      console.log(`Updating current calculation ${id}:`, data);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        "Accept": "application/json",
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/v1/current-calculations/${id}/edit-current-calculations`, {
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
      console.log('Current calculation updated:', responseData);
      return responseData;
    } catch (err) {
      console.error(`Failed to update current calculation ${id}:`, err);
      return null;
    }
  }
  
  // Подтвердить расчет
  export async function formCurrentCalculation(id: number): Promise<any | null> {
    try {
      console.log(`Forming current calculation ${id}...`);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        "Accept": "application/json",
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/v1/current-calculations/${id}/form`, {
        method: "PUT",
        headers
      });
      
      console.log(`Response status: ${res.status}`);
      
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Current calculation formed:', data);
      return data;
    } catch (err) {
      console.error(`Failed to form current calculation ${id}:`, err);
      return null;
    }
  }
  
  // Удалить расчет
  export async function deleteCurrentCalculation(id: number): Promise<boolean> {
    try {
      console.log(`Deleting current calculation ${id}...`);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        "Accept": "application/json",
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/v1/current-calculations/${id}/delete-current-calculations`, {
        method: "DELETE",
        headers
      });
      
      console.log(`Response status: ${res.status}`);
      
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      }
      
      console.log('Current calculation deleted successfully');
      return true;
    } catch (err) {
      console.error(`Failed to delete current calculation ${id}:`, err);
      return false;
    }
  } 