import type { Plugin } from "white-web-sdk";
import { VideoJsPlugin } from "./VideoJsPlugin";

export const videoJsPlugin = (): Plugin => {
    return {
        render: VideoJsPlugin,
    };
};
