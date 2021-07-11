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
import debounce from "lodash.debounce";

export type PlayerControllerProps = {
    fullTime: number; // ms
    progressTime: number;
    play: () => void;
    pause: () => void;
    paused: boolean;
    seekTime: (time: number) => void;
    handleVolume: (data: number) => void;
    volume: number;
    bufferProgress: number;
    isDisplay: boolean;
}

export type PlayerControllerStates = {
    isPlayerSeeking: boolean;
    isVolumeHover: boolean;
    seekVolume: number;
    isDisplay: boolean;
    currentTime: number;
};


export default class PlayerController extends React.Component<PlayerControllerProps, PlayerControllerStates> {
    private stageVolume: number = 0;
    private updateVolumeTimer: number;
    private onVolumeSeeking: boolean = false;

    public constructor(props: PlayerControllerProps) {
        super(props);
        this.state = {
            isPlayerSeeking: false,
            isVolumeHover: false,
            seekVolume: 1,
            isDisplay: true,
            currentTime: 0,
        };
        this.stageVolume = props.volume;
    }

    public componentDidMount(): void {
        this.updateVolumeTimer = setInterval(() => {
            if (!this.onVolumeSeeking) {
                this.setState({ seekVolume: this.props.volume });
            }
            if (!this.state.isPlayerSeeking) {
                this.setState({ currentTime: this.props.progressTime });
            }
        }, 100);
    }

    public componentWillUnmount() {
        if (this.updateVolumeTimer) {
            clearInterval(this.updateVolumeTimer);
        }
    }

    private onClickOperationButton = (): void => {
        const { paused } = this.props;
        if (paused) {
            this.props.play();
        } else {
            this.props.pause();
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

    private onChange = (time: number, offsetTime: number) => {
        this.setState({ currentTime: time });
        if (!isNaN(time)) {
            this.changeTime(time);
        }
    };

    private changeTime = debounce((time: number) => {
        this.props.seekTime(time);
    }, 50);

    private onVolumeChange = (time: number, offsetTime: number) => {
        this.setState({ seekVolume: time / 100 });
        this.changeVolume(time);
    };

    private changeVolume = debounce((time: number) => {
        this.props.handleVolume(time / 100);
    }, 50);

    private onVolumeSeekStart = () => {
        this.onVolumeSeeking = true;
    }

    private onVolumeSeekEnd = () => {
        this.onVolumeSeeking = false;
    }



    public render(): React.ReactNode {
        const { fullTime, progressTime } = this.props;
        return (
            <div
                className="player-schedule"
                style={{ display: this.props.isDisplay ? "block" : "none" }}>
                <div className="player-mid-box">
                    <SeekSlider
                        fullTime={fullTime}
                        currentTime={this.state.currentTime}
                        onChange={this.onChange}
                        bufferProgress={this.props.bufferProgress}
                        bufferColor={"rgba(255,255,255,0.3)"}
                        hideHoverTime={true}
                        onSeekStart={() => {
                            this.setState({ isPlayerSeeking: true });
                        }}
                        onSeekEnd={() => {
                            this.setState({ isPlayerSeeking: false });
                        }}
                        limitTimeTooltipBySides={true}
                        play={this.props.play}
                        pause={this.props.pause}
                        paused={this.props.paused} />
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
                                        currentTime={100 * this.state.seekVolume}
                                        onChange={this.onVolumeChange}
                                        hideHoverTime={true}
                                        limitTimeTooltipBySides={true}
                                        onSeekStart={this.onVolumeSeekStart}
                                        onSeekEnd={this.onVolumeSeekEnd} />
                                </div>
                            </div>
                        </div>
                        <div>
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
