import Keycloak, { KeycloakOnLoad } from "keycloak-js";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

const initOptions = {
  url: "http://127.0.0.1:8085/auth",
  realm: "local",
  clientId: "app-vue",
  onLoad: "login-required" as KeycloakOnLoad,
};

const keycloak = new Keycloak(initOptions);
keycloak
  .init({ onLoad: initOptions.onLoad })
  .then((auth) => {
    if (!auth) {
      window.location.reload();
    } else {
      createApp(App).use(store).use(router).mount("#app");
    }

    //Token Refresh
    setInterval(() => {
      keycloak
        .updateToken(70)
        .then((refreshed) => {
          if (refreshed) {
            console.log("Token refreshed" + refreshed);
          } else {
            if (keycloak && keycloak.tokenParsed?.exp && keycloak.timeSkew) {
              console.log(
                "Token not refreshed, valid for " +
                  Math.round(
                    keycloak.tokenParsed.exp +
                      keycloak.timeSkew -
                      new Date().getTime() / 1000
                  ) +
                  " seconds"
              );
            }
          }
        })
        .catch(() => {
          console.log("Failed to refresh token");
        });
    }, 6000);
  })
  .catch(() => {
    console.error("Authenticated Failed");
  });
