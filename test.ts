import type { ApplianceNames, DeviceType, Room } from "white-web-sdk";

declare var __APPID__: string, __TOKEN__: string, __ROOM_UUID__: string, __ROOM_TOKEN__: string;

// prettier-ignore
declare var WhiteWebSdk: (
    typeof import("white-web-sdk") &
    typeof import("white-web-sdk").WhiteWebSdk
);

declare var WhiteWebSdkVideoJsPlugin: typeof import("./src");

const $ = <T extends string>(s: T) => document.querySelector(s)!;
const log = console.log.bind(console);

function stat(s: string) {
    $("#state").textContent = s;
}

function post(path: string, body: object) {
    return fetch(`https://api.netless.link/v5/${path}`, {
        method: "POST",
        headers: { token: __TOKEN__, region: "cn-hz", "Content-Type": "application/json" },
        body: JSON.stringify(body),
    }).then(r => r.json());
}

const { createPlugins } = WhiteWebSdk;
const { PluginId, Version, videoJsPlugin } = WhiteWebSdkVideoJsPlugin;

const plugins = createPlugins({
    [PluginId]: videoJsPlugin({
        log: console.debug.bind(console),
    }),
});
plugins.setPluginContext(PluginId, { enable: true, verbose: true });

log("plugins =", plugins);
log(`%c[plugin:${PluginId}@${Version}]`, "font-size: 20px; color: orange; font-weight: bold");

const sdk = new WhiteWebSdk({
    appIdentifier: __APPID__,
    deviceType: "surface" as DeviceType,
    plugins,
});

const uuid = __ROOM_UUID__;
const roomToken = __ROOM_TOKEN__;

if (uuid && roomToken) {
    joinRoom(uuid, roomToken);
} else {
    post("rooms", { name: "test1", limit: 0 }).then(({ uuid }) => {
        log(`room uuid = ${uuid}`);
        post(`tokens/rooms/${uuid}`, { lifespan: 0, role: "admin" }).then(roomToken => {
            joinRoom(uuid, roomToken);
        });
    });
}

function joinRoom(uuid: string, roomToken: string) {
    sdk.joinRoom({ uid: Math.random().toString(36).slice(2), uuid, roomToken }).then(room_ => {
        room_.bindHtmlElement(document.querySelector("#app"));
        (window as any).room = room_;
        stat("loaded.");
        room_.setMemberState({
            currentApplianceName: "selector" as ApplianceNames,
        });
        ($("#btn") as HTMLButtonElement).onclick = function insertPlugin() {
            room_.insertPlugin(PluginId, {
                originX: -240,
                originY: -43,
                width: 480,
                height: 86,
                attributes: {
                    src: "https://flat-storage.oss-accelerate.aliyuncs.com/cloud-storage/2022-03/28/e35a6676-aa5d-4a61-8f17-87e626b7d1b7/e35a6676-aa5d-4a61-8f17-87e626b7d1b7.mp4",
                    hostTime: room_.calibrationTimestamp,
                },
            });
            room_.setMemberState({
                currentApplianceName: "selector" as ApplianceNames,
            });
        };
        ($("#btn") as HTMLButtonElement).disabled = false;
    });
}
