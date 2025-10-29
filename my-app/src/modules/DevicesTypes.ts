
  // modules/DevicesTypes.ts
export interface Device {
    device_id: number;
    name: string;
    type: string;
    power_nominal: number;
    resistance: number;
    voltage_nominal: number;
    coeff_reserve: number;
    coeff_efficiency: number;
    current_required: number;
    description: string;
    image: string;
    in_stock: boolean;
    is_delete: boolean;
  }