import React, { Component } from "react";
import videojs, { VideoJsPlayer } from "video.js";
import { autorun, CNode, Player, PlayerConsumer, Room, RoomConsumer } from "white-web-sdk";
import { options } from "../options";
import { Props } from "../types";
import { getCurrentTime, nextFrame } from "../utils";
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
    updater: boolean;
    controllerVisible: boolean;
}

export type PropsWithDisplayer = Props & { room?: Room; player?: Player };

class Impl extends Component<PropsWithDisplayer, State> {
    container = React.createRef<HTMLDivElement>();
    player!: VideoJsPlayer;
    controllerHiddenTimer = 0;
    syncPlayerTimer = 0;

    constructor(props: PropsWithDisplayer) {
        super(props);
        this.state = {
            NoSound: false,
            updater: false,
            controllerVisible: false,
        };

        (window as any).plugin = this.props.plugin;
    }

    render() {
        const s = this.props.plugin.attributes;
        const duration = (this.player?.duration() || 1e3) * 1000;
        const bufferedPercent = this.player?.bufferedPercent() || 0;
        return (
            <div
                className="video-js-plugin-container"
                onMouseEnter={() => {
                    this.setState({ controllerVisible: true });
                    this.setControllerHide();
                }}
                onMouseMove={() => {
                    this.setState({ controllerVisible: true });
                    this.setControllerHide();
                }}
            >
                <div className="video-js-plugin-player" ref={this.container}></div>
                <div className="videojs-plugin-close-icon">&times;</div>
                <PlayerController
                    pause={this.pause}
                    volume={s.volume}
                    handleVolume={this.handleVolume}
                    play={this.play}
                    paused={s.paused}
                    duration={duration}
                    seekTime={this.seekTime}
                    bufferProgress={duration * bufferedPercent}
                    progressTime={s.currentTime * 1000}
                    visible={this.state.controllerVisible}
                />
            </div>
        );
    }

    play = () => {
        this.props.plugin.putAttributes({ paused: false });
    };

    pause = () => {
        this.props.plugin.putAttributes({ paused: true });
    };

    handleVolume = (volume: number) => {
        this.props.plugin.putAttributes({ volume });
    };

    seekTime = (t: number) => {
        const hostTime = this.props.room?.calibrationTimestamp;
        this.props.plugin.putAttributes({ currentTime: t / 1000, hostTime });
    };

    componentDidMount() {
        this.initPlayer();
        autorun(this.syncPlayerWithAttributes);
        this.syncPlayerTimer = setInterval(this.syncPlayerWithAttributes, options.syncInterval);
    }

    componentWillUnmount() {
        this.player?.dispose();
        clearInterval(this.syncPlayerTimer);
    }

    syncPlayerWithAttributes = () => {
        void this.props.plugin.context;
        const s = this.props.plugin.attributes;
        console.log(JSON.stringify(s));

        const player = this.player;
        if (!player) return;

        if (player.paused() !== s.paused) {
            if (s.paused) {
                player.pause();
            } else {
                player.play();
            }
        }

        if (player.muted() !== s.muted) {
            player.muted(s.muted);
        }

        if (player.volume() !== s.volume) {
            player.volume(s.volume);
        }

        const currentTime = getCurrentTime(s, this.props);
        if (Math.abs(player.currentTime() - currentTime) > options.currentTimeMaxError) {
            player.currentTime(currentTime);
        }
    };

    setControllerHide = () => {
        if (this.controllerHiddenTimer) {
            clearTimeout(this.controllerHiddenTimer);
            this.controllerHiddenTimer = 0;
        }
        this.controllerHiddenTimer = setTimeout(() => {
            this.setState({ controllerVisible: false });
            this.controllerHiddenTimer = 0;
        }, 3000);
    };

    async initPlayer() {
        this.player?.dispose();

        const { src, poster } = this.props.plugin.attributes;

        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-vjs-player", "");

        const video = document.createElement("video");
        video.className = "video-js";
        poster && (video.poster = poster);

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

        const player = videojs(video);
        this.player = player;

        player.one("loadedmetadata", () => {
            this.setState({ updater: !this.state.updater });
        });

        player.on("ready", () => {
            options.onPlayer?.(player);
            player.on("timeupdate", () => {
                this.setState({ updater: !this.state.updater });
            });
        });

        (window as any).player = player;
    }
}
