// Определяем, запущено ли приложение в Tauri
const isTauri = typeof window !== 'undefined' && Boolean((window as any).__TAURI_IPC__);

// Используем переменные окружения, чтобы легко подставить IP сервера в локальной сети
// Пример для Tauri: VITE_API_BASE=http://192.168.0.11:80/api/v1
//                   VITE_IMG_BASE=http://192.168.0.11:9000/lab1/img
const API_BASE_ENV = import.meta.env.VITE_API_BASE as string | undefined;
const IMG_BASE_ENV = import.meta.env.VITE_IMG_BASE as string | undefined;

// Значения по умолчанию:
// - для браузера: /api/v1 (ожидается прокси/Pages)
// - для Tauri: локальная сеть (поменяй IP при необходимости)
const API_BASE_DEFAULT = isTauri ? "http://192.168.0.11:80/api/v1" : "/api/v1";
const IMG_BASE_DEFAULT = isTauri ? "http://192.168.0.11:9000/lab1/img" : "http://localhost:9000";

export const dest_api = API_BASE_ENV ?? API_BASE_DEFAULT;
export const dest_img = IMG_BASE_ENV ?? IMG_BASE_DEFAULT;
export const dest_root = "";