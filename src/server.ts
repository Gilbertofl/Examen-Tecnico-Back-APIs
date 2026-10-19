import { createApp } from "./app";
import { environment } from "./config/environment";

createApp().listen(environment.port, () => {
  console.log(`API escuchando en http://localhost:${environment.port}`);
});
