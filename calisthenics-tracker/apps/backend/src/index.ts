import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env") });
config({ path: resolve(__dirname, "../../../.env.local") });

import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(`[cali-api] http://${HOST}:${PORT}`);
  console.log(`[cali-api] LAN: http://<your-ip>:${PORT}`);
});
