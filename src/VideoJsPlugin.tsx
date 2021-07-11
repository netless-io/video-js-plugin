import React, { Component } from "react";
import { CNode, Player, PlayerConsumer, Room, RoomConsumer } from "white-web-sdk";
import { Transform } from "./components/Transform";
import { Props } from "./types";

export class VideoJsPlugin extends Component<Props> {
    render() {
        const { cnode, size, scale } = this.props;
        return (
            <CNode context={cnode}>
                <Transform size={size} scale={scale}>
                    <RoomConsumer
                        children={room => <VideoJsPlayer room={room} {...this.props} />}
                    />
                    <PlayerConsumer
                        children={player => <VideoJsPlayer player={player} {...this.props} />}
                    />
                </Transform>
            </CNode>
        );
    }
}

interface State {
    NoSound: boolean;
}

type PropsWithDisplayer = Props & { room?: Room; player?: Player };

class VideoJsPlayer extends Component<PropsWithDisplayer, State> {
    render() {
        const { room, player } = this.props;
        return (
            <div>
                <div className="video-js-container"></div>
            </div>
        );
    }
}
