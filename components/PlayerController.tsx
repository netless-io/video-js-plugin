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
    seekVolume: number;
};


export default class PlayerController extends React.Component<PlayerControllerProps, PlayerControllerStates> {
    private progressTime: number = 0;
    private stageVolume: number = 0;
    private updateVolumeTimer: number;
    private onVolumeSeeking: boolean = false;

    public constructor(props: PlayerControllerProps) {
        super(props);
        this.state = {
            isPlayerSeeking: false,
            currentTime: 0,
            isVolumeHover: false,
            seekVolume: 1,
        };
        this.stageVolume = props.volume;
    }

    public componentDidMount(): void {
        this.updateVolumeTimer = setInterval(() => {
            if (!this.onVolumeSeeking) {
                this.setState({ seekVolume: this.props.volume });
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

    private onChange = debounce((time: number, offsetTime: number) => {
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
            <div className="player-schedule">
                <div className="player-mid-box">
                    <SeekSlider
                        fullTime={fullTime}
                        currentTime={this.getCurrentTime(progressTime)}
                        onChange={this.onChange}
                        hideHoverTime={true}
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
