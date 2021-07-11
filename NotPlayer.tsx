declare var React: typeof import("react");
declare var videojs: typeof import("video.js").default;
import PlayerController from "./components/PlayerController"

console.log(
    `%cVIDEO JS VERSION ${videojs.VERSION}`,
    "font-size: 20px; font-weight: bold; color: cyan"
);

export class NotPlayer extends React.Component<{}, { paused: boolean, fullTime: number, progressTime: number, volume: number }> {
    video = React.createRef<HTMLVideoElement>();
    player: videojs.VideoJsPlayer;

    constructor(props: {}) {
        super(props);
        this.state = {
            paused: true,
            fullTime: 0,
            progressTime: 0,
            volume: 1,
        };
    }

    private play = (): void => {
        this.player.play();
    }

    private pause = (): void => {
        this.player.pause();
    }

    private handleVolume = (data: number): void => {
        this.player.volume(data);
    }

    render() {
        return (
            <div>
                <div style={{ width: 600, height: 400, position: "relative" }}>
                    <video className="video-js" ref={this.video}></video>
                    <span className="title">Audio Player</span>
                    <span className="close-icon">&times;</span>
                    <PlayerController
                        pause={this.pause}
                        volume={this.state.volume}
                        handleVolume={this.handleVolume}
                        play={this.play}
                        paused={this.state.paused}
                        fullTime={this.state.fullTime * 1000}
                        seekTime={this.seekTime}
                        progressTime={this.state.progressTime * 1000} />
                </div>
            </div>
        );
    }

    seekTime = (time: number): void => {
        this.player.currentTime(time / 1000);
    }

    componentDidMount() {
        this.player = videojs(this.video.current!);
        this.player.src(
            "https://beings.oss-cn-hangzhou.aliyuncs.com/test/aaa59a55-81ff-45e8-8185-fd72c695def4/1606277539701637%E7%9A%84%E5%89%AF%E6%9C%AC.mp4"
        );
        this.player.on("ready", () => {
            this.player.on("play", this.onPlayerState)
            this.player.on("pause", this.onPlayerState)
            this.player.one("loadedmetadata", this.onPlayerState)
            this.player.on("timeupdate", this.onPlayerState)
            this.player.on("volumechange", this.onPlayerState)
        });
    }

    onPlayerState = (): void => {
        this.setState({
            paused: this.player.paused(),
            fullTime: this.player.duration(),
            volume: this.player.volume(),
            progressTime: this.player.currentTime(),
        });
    }

    clickPlayPause = () => {
        const paused = !this.state.paused;
        this.setState({ paused });
        if (paused) {
            this.player.pause();
        } else {
            this.player.play();
        }
    };
}
