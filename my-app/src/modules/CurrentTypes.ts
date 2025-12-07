// modules/CurrentTypes.ts

export interface CurrentDevice {
    curr_dev_id?: number;
    current_id?: number;
    device_id: number;
    amount?: number;
    amperage?: number;
    device_name?: string;
    device_power?: number;
    device_image?: string;
  }
  
  export interface CurrentCalculation {
    current_id?: number;
    id?: number;
    status?: string;
    creator_login?: string;
    created_at?: string;
    form_date?: string;
    finish_date?: string;
    moderator_login?: string;
    voltage_bord?: number;
    devices?: CurrentDevice[];
    devices_count?: number;
    amperage?: number;
    total_amperage?: number;
  }
  
  export interface CurrentCart {
    current_id?: number;
    id?: number;
    status: 'draft';
    devices?: any[];
    devices_count?: number;
    voltage_bord?: number;
    creator_login?: string;
    created_at?: string;
  }