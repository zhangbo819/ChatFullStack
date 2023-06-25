import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import vConsole from 'vconsole'
import "./style.css";
import App from "./App.vue";
import router from "./router";

const vconsole = new vConsole();

const AppBase = createApp(App);
AppBase.use(router)
  .use(ElementPlus)
  .use(vconsole as any)
  .mount("#app");
