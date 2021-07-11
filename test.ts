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

const plugins = createPlugins({ [PluginId]: videoJsPlugin() });
plugins.setPluginContext(PluginId, { disabled: false, verbose: true });

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
    sdk.joinRoom({ uuid, roomToken }).then(room_ => {
        room_.bindHtmlElement(document.querySelector("#app"));
        (window as any).room = room_;
        stat("loaded.");
        ((window as any).room as Room).setMemberState({
            currentApplianceName: "selector" as ApplianceNames,
        });
        ($("#btn") as HTMLButtonElement).onclick = function insertPlugin() {
            ((window as any).room as Room).insertPlugin("video.js", {
                originX: -240,
                originY: -43,
                width: 480,
                height: 86,
                attributes: {
                    src: "https://beings.oss-cn-hangzhou.aliyuncs.com/test/aaa59a55-81ff-45e8-8185-fd72c695def4/1606277539701637%E7%9A%84%E5%89%AF%E6%9C%AC.mp4",
                },
            });
            ((window as any).room as Room).setMemberState({
                currentApplianceName: "selector" as ApplianceNames,
            });
        };
        ($("#btn") as HTMLButtonElement).disabled = false;
    });
}
