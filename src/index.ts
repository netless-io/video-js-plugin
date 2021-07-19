import { Plugin } from "white-web-sdk";
import { VideoJsPlugin } from "./components/VideoJsPlugin";
import { PluginId } from "./constants";
import { setOptions, VideoJsPluginOptions } from "./options";

export * from "./constants";
export { VideoJsPluginOptions } from "./options";
export { PluginContext, VideoJsPluginAttributes } from "./types";

export const videoJsPlugin = (options?: Partial<VideoJsPluginOptions>): Plugin => {
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
            close: true,
        },
    };
};
