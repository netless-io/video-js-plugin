import React, { Component } from "react";
import videojs, { VideoJsPlayer } from "video.js";
import { autorun, CNode, Player, PlayerConsumer, Room, RoomConsumer } from "white-web-sdk";
import { options } from "../options";
import { Props } from "../types";
import { checkWhiteWebSdkVersion, getCurrentTime, nextFrame } from "../utils";
import PlayerController from "./PlayerController";
import "./style.css";
import { FlexTransform } from "./Transform";

export class VideoJsPlugin extends Component<Props> {
    render() {
        const { cnode, size, scale } = this.props;
        return (
            <CNode context={cnode}>
                <FlexTransform size={size} scale={scale}>
                    <RoomConsumer>
                        {room => room && <Impl room={room} {...this.props} />}
                    </RoomConsumer>
                    <PlayerConsumer>
                        {player => player && <Impl player={player} {...this.props} />}
                    </PlayerConsumer>
                </FlexTransform>
            </CNode>
        );
    }
}

interface State {
    NoSound: boolean;
    MediaError: boolean;
    updater: boolean;
    controllerVisible: boolean;
}

export type PropsWithDisplayer = Props & { room?: Room; player?: Player };

class Impl extends Component<PropsWithDisplayer, State> {
    closeIcon: HTMLSpanElement | null = null;
    alertMask: HTMLDivElement | null = null;
    container = React.createRef<HTMLDivElement>();
    player: VideoJsPlayer | undefined;
    controllerHiddenTimer = 0;
    syncPlayerTimer = 0;
    retryCount = 0;
    decreaseRetryTimer = 0;
    disposer?: () => void;

    constructor(props: PropsWithDisplayer) {
        super(props);
        this.state = {
            NoSound: false,
            MediaError: false,
            updater: false,
            controllerVisible: false,
        };

        props.room && checkWhiteWebSdkVersion(props.room);
    }

    render() {
        const s = this.props.plugin.attributes;
        const duration = (this.player?.duration() || 1e3) * 1000;
        const bufferedPercent = this.player?.bufferedPercent() || 0;

        // const controllerVisible = this.state.isAudio || this.state.controllerVisible;
        return (
            <div
                className={this.isEnabled() ? "vjs-p" : "vjs-p disabled"}
                onMouseEnter={this.showController}
                onMouseMove={this.showController}
            >
                <div className="video-js-plugin-player" ref={this.container}></div>
                <div className="video-js-plugin-header">
                    {/* <div className="video-js-plugin-title">Sync Player</div> */}
                    {(s.close ?? true) && (
                        <div className="videojs-plugin-close-icon" ref={this.setupClose}>
                            &times;
                        </div>
                    )}
                </div>
                <PlayerController
                    pause={this.pause}
                    volume={s.volume}
                    handleVolume={this.handleVolume}
                    play={this.play}
                    paused={s.paused}
                    duration={duration}
                    seekTime={this.seekTime}
                    bufferProgress={duration * bufferedPercent}
                    progressTime={getCurrentTime(s, this.props) * 1000}
                    scale={this.props.scale}
                    visible
                />
                {!this.props.plugin.context?.hideMuteAlert && this.state.NoSound && (
                    <div ref={this.setupAlert} className="videojs-plugin-muted-alert"></div>
                )}
                {this.state.MediaError && (
                    <div className="videojs-plugin-recovery-mode">
                        <button ref={this.setupReload}>Reload Player</button>
                    </div>
                )}
            </div>
        );
    }

    debug(msg: string, ...args: any[]) {
        if (this.props.plugin.context?.verbose) {
            console.log(`[VideoJS Plugin] ${msg}`, ...args);
        }
    }

    showController = () => {
        this.setState({ controllerVisible: true });
        this.debounceHidingController();
    };

    play = () => {
        const hostTime = this.props.room?.calibrationTimestamp;
        this.debug(">>> play", { paused: false, hostTime });
        this.isEnabled() && this.props.plugin.putAttributes({ paused: false, hostTime });
    };

    pause = () => {
        const currentTime = getCurrentTime(this.props.plugin.attributes, this.props);
        this.debug(">>> pause", { paused: true, currentTime });
        this.isEnabled() && this.props.plugin.putAttributes({ paused: true, currentTime });
    };

    handleVolume = (volume: number) => {
        this.debug(">>> volume", { volume });
        this.isEnabled() && this.props.plugin.putAttributes({ volume });
    };

    seekTime = (t: number) => {
        const hostTime = this.props.room?.calibrationTimestamp;
        this.debug(">>> seek", { currentTime: t / 1000, hostTime });
        this.isEnabled() && this.props.plugin.putAttributes({ currentTime: t / 1000, hostTime });
    };

    resetPlayer = () => {
        this.player?.autoplay(false);
        this.debug(">>> ended", { paused: true, currentTime: 0 });
        this.isEnabled() && this.props.plugin.putAttributes({ paused: true, currentTime: 0 });
    };

    componentDidMount() {
        this.initPlayer();
        this.disposer = autorun(this.syncPlayerWithAttributes);
        this.syncPlayerTimer = setInterval(this.syncPlayerWithAttributes, options.syncInterval);
        this.decreaseRetryTimer = setInterval(this.decreaseRetryCount, options.retryInterval);
    }

    componentWillUnmount() {
        this.disposer?.();
        this.player?.dispose();
        clearInterval(this.syncPlayerTimer);
        clearInterval(this.decreaseRetryTimer);
    }

    syncPlayerWithAttributes = () => {
        void this.props.plugin.context;
        const s = this.props.plugin.attributes;

        const player = this.player;
        if (!player) return;

        if (player.paused() !== s.paused) {
            this.debug("<<< paused -> %o", s.paused);
            if (s.paused) {
                player.pause();
            } else {
                player.play()?.catch(this.catchPlayFail);
            }
        }

        // NOTE: 2 actions below will cause error message in console (ignore them)
        if (player.muted() !== s.muted) {
            this.debug("<<< muted -> %o", s.muted);
            player.muted(s.muted);
        }

        if (player.volume() !== s.volume) {
            this.debug("<<< volume -> %o", s.volume);
            player.volume(s.volume);
        }

        const currentTime = getCurrentTime(s, this.props);
        if (currentTime > player.duration()) {
            this.resetPlayer();
        } else if (Math.abs(player.currentTime() - currentTime) > options.currentTimeMaxError) {
            this.debug("<<< currentTime -> %o", currentTime);
            player.currentTime(currentTime);
        }
    };

    debounceHidingController = () => {
        if (this.controllerHiddenTimer) {
            clearTimeout(this.controllerHiddenTimer);
            this.controllerHiddenTimer = 0;
        }
        this.controllerHiddenTimer = setTimeout(() => {
            this.setState({ controllerVisible: false });
            this.controllerHiddenTimer = 0;
        }, 3000);
    };

    decreaseRetryCount = () => {
        if (!this.player) return;
        if (this.retryCount > 0) {
            this.retryCount = this.retryCount - 1;
        }
    };

    catchPlayFail = (err: Error) => {
        if (String(err).includes("interact")) {
            this.player?.autoplay("any");
            this.setState({ NoSound: true });
        } else {
            const mediaError = this.player?.error();
            if (mediaError) {
                if (this.retryCount <= 3) {
                    this.initPlayer();
                    this.retryCount = this.retryCount + 1;
                } else {
                    this.debug("catch videojs media error", mediaError);
                    this.setState({ MediaError: true });
                }
            }
            this.debug("catch error", err);
        }
    };

    fixPlayFail = () => {
        this.debug("try to fix play state");
        this.setState({ NoSound: false });
        const { muted, volume } = this.props.plugin.attributes;
        if (this.player) {
            this.player.muted(muted);
            this.player.volume(volume);
        }
    };

    initPlayer = async () => {
        this.player?.dispose();
        this.player = undefined;

        this.debug("creating elements ...");
        const { src, poster } = this.props.plugin.attributes;

        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-vjs-player", "");

        const video = document.createElement("video");
        video.className = "video-js";
        poster && (video.poster = poster);

        video.setAttribute("playsInline", "");
        video.setAttribute("webkit-playsinline", "");

        const source = document.createElement("source");
        if (new URL(src).pathname.endsWith(".m3u8")) {
            source.type = "application/x-mpegURL";
        } else {
            video.src = src;
        }
        source.src = src;

        video.appendChild(source);
        wrapper.appendChild(video);
        this.container.current!.appendChild(wrapper);

        // NOTE: don't remove this line!
        await nextFrame();

        this.debug("initializing videojs() ...");
        const player = videojs(video);
        this.player = player;

        player.one("loadedmetadata", this.gracefullyUpdate);

        player.on("ready", () => {
            options.onPlayer?.(player);

            player.on("timeupdate", this.gracefullyUpdate);
            player.on("volumechange", this.gracefullyUpdate);
            player.on("seeked", this.gracefullyUpdate);
            player.on("play", this.gracefullyUpdate);
            player.on("pause", this.gracefullyUpdate);
            player.on("ended", this.resetPlayer);
        });

        player.on("error", this.catchPlayFail);

        this.setState({ MediaError: false });
    };

    gracefullyUpdate = () => this.setState({ updater: !this.state.updater });

    setupClose = (element: HTMLSpanElement | null) => {
        if (element) {
            element.addEventListener("touchstart", this.removeSelf);
            element.addEventListener("click", this.removeSelf);
        }
        this.closeIcon = element;
    };

    setupAlert = (element: HTMLDivElement | null) => {
        if (element) {
            element.addEventListener("touchstart", this.fixPlayFail);
            element.addEventListener("click", this.fixPlayFail);
        }
        this.alertMask = element;
    };

    setupReload = (element: HTMLButtonElement | null) => {
        if (element) {
            element.addEventListener("touchstart", this.initPlayer);
            element.addEventListener("click", this.initPlayer);
        }
    };

    removeSelf = () => this.props.plugin.remove();

    isEnabled() {
        if (!this.props.room?.isWritable) return false;
        const { identity, enable } = this.props.plugin.context || {};

        if (identity === undefined && enable === undefined) {
            // if not set, default to false
            return false;
        }

        if (identity) {
            // @deprecated respect identity
            return ["host", "publisher"].includes(identity);
        }

        return Boolean(enable);
    }
}
