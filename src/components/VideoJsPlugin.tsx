import React, { Component } from "react";
import videojs, { VideoJsPlayer } from "video.js";
import { autorun, CNode, Player, PlayerConsumer, Room, RoomConsumer } from "white-web-sdk";
import { Props } from "../types";
import "./style.css";
import { FlexTransform } from "./Transform";

export class VideoJsPlugin extends Component<Props> {
    render() {
        const { cnode, size, scale } = this.props;
        return (
            <CNode context={cnode}>
                <FlexTransform size={size} scale={scale}>
                    <RoomConsumer>
                        {room => room && <VideoJsPluginPlayer room={room} {...this.props} />}
                    </RoomConsumer>
                    <PlayerConsumer>
                        {player =>
                            player && <VideoJsPluginPlayer player={player} {...this.props} />
                        }
                    </PlayerConsumer>
                </FlexTransform>
            </CNode>
        );
    }
}

interface State {
    NoSound: boolean;
}

type PropsWithDisplayer = Props & { room?: Room; player?: Player };

class VideoJsPluginPlayer extends Component<PropsWithDisplayer, State> {
    container = React.createRef<HTMLDivElement>();
    player: VideoJsPlayer | undefined;

    render() {
        const { room, player } = this.props;

        (window as any).plugin = this.props.plugin;
        return (
            <div className="video-js-plugin-container">
                <div className="video-js-plugin-player" ref={this.container}></div>
                <div className="videojs-plugin-close-icon">&times;</div>
            </div>
        );
    }

    componentDidMount() {
        this.initPlayer();
        autorun(() => {
            this.props.plugin.context;
            const { paused } = this.props.plugin.attributes;
            if (paused) {
                this.player!.pause();
            } else {
                this.player!.play();
            }
        });
    }

    onPlayerState = ({ type }: { type: string }) => {
        console.log(type);
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

        (window as any).player = player;
    }
}
