import { PropsWithDisplayer } from "./components/VideoJsPlugin";
import { VideoJsPluginAttributes } from "./types";

export function nextFrame() {
    return new Promise(r => (window.requestAnimationFrame || window.setTimeout)(r));
}

export function getCurrentTime(attributes: VideoJsPluginAttributes, props: PropsWithDisplayer) {
    if (attributes.paused) {
        return attributes.currentTime;
    }
    const now = getTimestamp(props);
    if (now) {
        return attributes.currentTime + (now - attributes.hostTime) / 1000;
    } else {
        return attributes.currentTime;
    }
}

export function getTimestamp(props: PropsWithDisplayer) {
    if (props.player) {
        return props.player.beginTimestamp + props.plugin.playerTimestamp;
    }
    if (props.room) {
        return props.room.calibrationTimestamp;
    }
}
