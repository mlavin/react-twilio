import React, { Component } from "react";
import propTypes from "prop-types";

class TwilioVideo extends Component {
  //This Component demands a video object, which is given to it by the overlying layer as a prop
  constructor(props) {
    super(props);
    this.state = {};
    this.alreadyAdded = [];
    this.cameraDisabled = true;
  }

  componentDidMount() {
    this.attachTracksToDOM(this.props.tracks);
  }

  componentWillReceiveProps(nextProps) {}

  componentDidUpdate() {
    this.attachTracksToDOM(this.props.tracks);
  }

  getTrackId() {
    let { tracks } = this.props;
    if (tracks.length > 0) {
      return tracks[0].sid;
    } else {
      return null;
    }
  }

  attachTracksToDOM(tracks) {
    let {
      primary,
      primaryDimensionChanged,
      secondaryDimensionChanged
    } = this.props;
    tracks.forEach(track => {
      if (this.alreadyAdded.indexOf(track.id) == -1) {
        this.alreadyAdded.push(track.id);
        if (primary) {
          track.on("dimensionsChanged", videoTrack => {
            primaryDimensionChanged(videoTrack.dimensions);
          });
        } else {
          track.on("dimensionsChanged", videoTrack => {
            secondaryDimensionChanged(videoTrack.dimensions);
          });
        }
        let dynamicallyGenerated = track.attach();
        dynamicallyGenerated.style.width = "100%";
        this.videoDiv.appendChild(dynamicallyGenerated);
      }
    });
  }

  toggleVideoTrack(tracks) {
    this.cameraDisabled = this.cameraDisabled ? false : true;
    tracks
      .filter(track => !track.isAudio)
      .forEach(track => {
        this.cameraDisabled ? track.disable() : track.enable();
      });
  }

  render() {
    let { tracks, remote, style, primary, onClick } = this.props;
    return (
      <div style={style}>
        {tracks.map(track => {
          return (
            <div
              key={track.sid}
              onClick={() => {
                onClick(this.getTrackId());
              }}
              ref={div => {
                this.videoDiv = div;
              }}
            ></div>
          );
        })}
      </div>
    );
  }
}

TwilioVideo.propTypes = {
  tracks: propTypes.array.isRequired,
  cameraDisabled: propTypes.bool
};

export default TwilioVideo;
