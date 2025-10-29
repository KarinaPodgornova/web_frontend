// src/Routes.tsx
export const ROUTES = {
  HOME: "/",
  DEVICES: "/devices",
  DEVICE: "/device/:id",
  CURRENT: "/current"
}

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  HOME: "Главная",
  DEVICES: "Устройства",
  DEVICE: "Устройство",
  CURRENT: "Текущая заявка"
};