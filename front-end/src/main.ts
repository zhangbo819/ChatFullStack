import { createApp } from "vue";
import "vant/es/toast/style";
// import vConsole from 'vconsole'

import "./style.css";
import App from "./App.vue";
import router from "./router";

// const vconsole = new vConsole();

const AppBase = createApp(App);
AppBase.use(router)
  // .use(vconsole as any)
  .mount("#app");
