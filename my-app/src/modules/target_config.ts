const target_tauri = false

export const api_proxy_addr = "http://localhost:80"
export const img_proxy_addr = "http://localhost:9000"
export const dest_api = (target_tauri) ? api_proxy_addr : "/api/v1"
export const dest_img =  (target_tauri) ?  "http://localhost:9000/lab1/img" : "http://localhost:9000"
export const dest_root = (target_tauri) ? "" : ""