// src/Routes.tsx
export const ROUTES = {
  Home: "/",

  DEVICES: "/devices",
  DEVICE: "/devices/:id",
  CURRENTS: "/currents",          // список расчётов
  CURRENT: "/current/:id",  
  SignIn: "/signin",
  SignUp: "/signup",
  Profile: "/users/:login/info"
}

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  Home: "Главная",
  DEVICES: "Устройства",
  DEVICE: "Устройство",
  CURRENT: "Текущая заявка",
  CURRENTS: "Мои заявки",
  SignIn: "Вход",
  SignUp: "Регистрация",
  Profile: "Профиль"
};