import { resolve } from "path";
import { generateApi } from "swagger-typescript-api";

generateApi({
  name: "Api.ts",
  output: resolve(process.cwd(), "./src/api"),
  url: "http://localhost:80/swagger/doc.json",
  httpClientType: "axios",
})