declare var WhiteWebSdkVideoJsPlugin: typeof import("./src");
const app = document.querySelector("#app")!;

app.textContent = JSON.stringify(Object.keys(WhiteWebSdkVideoJsPlugin));
