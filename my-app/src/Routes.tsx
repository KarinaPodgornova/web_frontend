// src/Routes.tsx
export const ROUTES = {
  Home: "/",

  DEVICES: "/devices",
  DEVICE: "/devices/:id",
  CURRENT: "/current",
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
  SignIn: "Вход",
  SignUp: "Регистрация",
  Profile: "Профиль"
};