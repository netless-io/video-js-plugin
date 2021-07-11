declare var React: typeof import("react");
declare var videojs: typeof import("video.js").default;
import "./PlayerController.css";
import SeekSlider from "./SeekSlider";
import { displayWatch } from "./WatchDisplayer";
import video_pause from "./image/video_pause.svg";
import video_play from "./image/video_play.svg";
import volume2 from "./image/vulme2.svg";
import volume1 from "./image/vulme1.svg";
import volume0 from "./image/vulme0.svg";
console.log(video_pause)

export type PlayerControllerProps = {
    fullTime: number; // ms
    progressTime: number;
    play: () => void;
    pause: () => void;
    paused: boolean;
    seekTime: (time: number) => void;
    handleVolume: (data: number) => void;
    volume: number;
}

export type PlayerControllerStates = {
    isPlayerSeeking: boolean;
    currentTime: number;
    isVolumeHover: boolean;
};


export default class PlayerController extends React.Component<PlayerControllerProps, PlayerControllerStates> {
    private progressTime: number = 0;
    private stageVolume: number = 0;

    public constructor(props: PlayerControllerProps) {
        super(props);
        this.state = {
            isPlayerSeeking: false,
            currentTime: 0,
            isVolumeHover: false,
        };
        this.stageVolume = props.volume;
    }


    public componentDidMount(): void {
    }

    public componentWillUnmount() {
    }

    private onClickOperationButton = (): void => {
        const { paused } = this.props;
        if (paused) {
            this.props.play();
        } else {
            this.props.pause();
        }
    }

    private getCurrentTime = (progressTime: number): number => {
        if (this.state.isPlayerSeeking) {
            this.progressTime = progressTime;
            return this.state.currentTime;
        } else {
            const isChange = this.progressTime !== progressTime;
            if (isChange) {
                return progressTime;
            } else {
                return this.state.currentTime;
            }
        }
    }

    private operationButton = (): React.ReactNode => {
        const { paused } = this.props;
        if (paused) {
            return <img src={video_play} />;
        } else {
            return <img src={video_pause} />;
        }
    }


    private operationVolumeButton = (): React.ReactNode => {
        if (this.props.volume === 1) {
            return <img src={volume2} />;
        } else if (this.props.volume === 0) {
            return <img src={volume0} />;
        } else {
            return <img src={volume1} />;
        }
    }

    private handleClickVolume = (): void => {
        if (this.props.volume === 0) {
            if (this.stageVolume !== 0) {
                this.props.handleVolume(this.stageVolume);
            } else {
                this.props.handleVolume(1);
            }
        } else {
            this.stageVolume = this.props.volume;
            this.props.handleVolume(0);
        }
    }


    public render(): React.ReactNode {
        const { fullTime, progressTime } = this.props;
        return (
            <div className="player-schedule">
                <div className="player-mid-box">
                    <SeekSlider
                        fullTime={fullTime}
                        currentTime={this.getCurrentTime(progressTime)}
                        onChange={(time: number, offsetTime: number) => {
                            this.props.seekTime(time);
                        }}
                        hideHoverTime={true}
                        limitTimeTooltipBySides={true} />
                </div>
                <div className="player-controller-box">
                    <div className="player-controller-mid">
                        <div className="player-left-box">
                            <div
                                onClick={() => {
                                    this.onClickOperationButton();
                                }}
                                className="player-controller">
                                {this.operationButton()}
                            </div>
                            <div
                                className="player-volume-box"
                                onMouseEnter={() => {
                                    this.setState({
                                        isVolumeHover: true,
                                    });
                                }
                                }
                                onMouseLeave={() => {
                                    this.setState({
                                        isVolumeHover: false,
                                    });
                                }}>
                                <div
                                    onClick={this.handleClickVolume}
                                    className="player-volume">
                                    {this.operationVolumeButton()}
                                </div>
                                <div className="player-volume-slider">
                                    <SeekSlider
                                        fullTime={100}
                                        currentTime={100 * this.props.volume}
                                        onChange={(time: number, offsetTime: number) => {
                                            this.props.handleVolume(time / 100);
                                        }}
                                        hideHoverTime={true}
                                        limitTimeTooltipBySides={true} />
                                </div>
                            </div>
                            <div className="player-mid-box-time">
                                {displayWatch(Math.floor(progressTime / 1000))} / {displayWatch(Math.floor(fullTime / 1000))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
