// modules/DevicesTypes.ts
export interface Device {
    id: number;
    image: string;
    title: string;
    description: string;
    power: string;
    specifications: string[];
    is_delete: boolean;
  }