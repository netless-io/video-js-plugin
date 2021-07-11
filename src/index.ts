import { Plugin } from "white-web-sdk";
import { PluginId } from "./constants";
import { setOptions, VideoJsPluginOptions } from "./options";
import { VideoJsPlugin } from "./VideoJsPlugin";

export * from "./constants";
export { VideoJsPluginOptions } from "./options";
export { PluginContext, VideoJsPluginAttributes } from "./types";

export const videoJsPlugin = (options?: VideoJsPluginOptions): Plugin => {
    options && setOptions(options);

    return {
        kind: PluginId,
        render: VideoJsPlugin,
        defaultAttributes: {
            src: "",
            poster: "",
            hostTime: 0,
            currentTime: 0,
            paused: true,
            muted: false,
            volume: 1,
        },
    };
};
