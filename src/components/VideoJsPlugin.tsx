import React, { Component } from "react";
import videojs, { VideoJsPlayer } from "video.js";
import { autorun, CNode, Player, PlayerConsumer, Room, RoomConsumer } from "white-web-sdk";
import { Props } from "../types";
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

    fullTime: number; // s
    bufferedPercent: number;
    isDisplay: boolean;
}

type PropsWithDisplayer = Props & { room?: Room; player?: Player };

class Impl extends Component<PropsWithDisplayer, State> {
    container = React.createRef<HTMLDivElement>();
    player: VideoJsPlayer | undefined;
    controllerHiddenTimer = 0;

    constructor(props: PropsWithDisplayer) {
        super(props);
        this.state = {
            NoSound: false,
            fullTime: 0,
            bufferedPercent: 0,
            isDisplay: false,
        };

        (window as any).plugin = this.props.plugin;
    }

    render() {
        const { room, player, plugin } = this.props;
        const { volume, paused, currentTime, hostTime } = plugin.attributes;
        const progressTime = currentTime + (room!.calibrationTimestamp - hostTime) / 1000;

        return (
            <div
                className="video-js-plugin-container"
                onMouseEnter={() => {
                    this.setState({ isDisplay: true });
                    this.setControllerHide();
                }}
                onMouseMove={() => {
                    this.setState({ isDisplay: true });
                    this.setControllerHide();
                }}
            >
                <div className="video-js-plugin-player" ref={this.container}></div>
                <div className="videojs-plugin-close-icon">&times;</div>
                <PlayerController
                    pause={this.pause}
                    volume={volume}
                    handleVolume={this.handleVolume}
                    play={this.play}
                    paused={paused}
                    fullTime={this.state.fullTime * 1000}
                    seekTime={this.seekTime}
                    bufferProgress={this.state.fullTime * 1000 * this.state.bufferedPercent}
                    progressTime={progressTime * 1000}
                    isDisplay={this.state.isDisplay}
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
        this.props.plugin.putAttributes({ currentTime: t, hostTime });
    };

    componentDidMount() {
        this.initPlayer();
        autorun(() => {
            this.props.plugin.context;
            const player = this.player!;
            const s = this.props.plugin.attributes;
            console.log(JSON.stringify(s));

            if (player.paused() !== s.paused) {
                if (s.paused) {
                    player!.pause();
                } else {
                    player!.play();
                }
            }

            if (player.muted() !== s.muted) {
                player!.muted(s.muted);
            }

            if (player.volume() !== s.volume) {
                player!.volume(s.volume);
            }

            if (player.currentTime() !== s.currentTime) {
                player.currentTime(s.currentTime);
            }
        });
    }

    setControllerHide = () => {
        if (this.controllerHiddenTimer) {
            clearTimeout(this.controllerHiddenTimer);
            this.controllerHiddenTimer = 0;
        }
        this.controllerHiddenTimer = setTimeout(() => {
            this.setState({ isDisplay: false });
            this.controllerHiddenTimer = 0;
        }, 3000);
    };

    initPlayer() {
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

        const player = videojs(video);
        this.player = player;

        player.one("loadedmetadata", () => {
            this.setState({
                fullTime: this.player!.duration(),
                bufferedPercent: this.player!.bufferedPercent(),
            });
        });

        player.on("ready", () => {
            player.on("timeupdate", () => {
                this.setState({
                    bufferedPercent: this.player!.bufferedPercent(),
                });
            });
        });

        (window as any).player = player;
    }
}
