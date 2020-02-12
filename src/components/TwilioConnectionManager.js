import React, { Component } from "react";
import TwilioRemoteAndLocalHolder from "./TwilioRemoteAndLocalHolder";
import propTypes from "prop-types";
const { connect } = require("twilio-video");

function getTracks(participant) {
  return Array.from(participant.tracks.values())
    .filter(function(publication) {
      return publication.track;
    })
    .map(function(publication) {
      const track = publication.track;
      track.isAudio = track.kind == "audio";
      return track;
    });
}

class TwilioConnectionManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tracks: {
        local: [],
        remote: {}
      },
      localAudioMute: false,
      localVideoMute: false
    };
    let localTrackRoom;
  }

  componentDidMount() {
    let { token, roomName, initialCamera } = this.props;
    this.connectToTwilio(token, roomName, initialCamera);
  }

  componentWillUnmount() {
    this.disconnectCall();
  }

  async connectToTwilio(token, roomName, initialCamera) {
    const room = await connect(token, {
      name: roomName,
      audio: true,
      video: initialCamera
    }).then(
      roomConnection => {
        this.localTrackRoom = roomConnection;
        this.setState(prevState => {
          return { ...prevState, currentRoom: room };
        });
        this.iterateLocalParticipantTracks(roomConnection.localParticipant);
        roomConnection.participants.forEach(this.participantConnected);
        roomConnection.on("participantConnected", this.participantConnected);
        roomConnection.on(
          "participantDisconnected",
          this.participantDisconnected
        );
        roomConnection.once("disconnected", error =>
          roomConnection.participants.forEach(this.participantDisconnected)
        );
      },
      err => {
        console.log(err);
      }
    );
  }

  participantConnected = participant => {
    participant.on("trackPublished", () => {
      this.iterateParticipantTracks(participant);
    });
    participant.on("trackSubscribed", () => {
      this.iterateParticipantTracks(participant);
    });
    participant.on("trackUnpublished", () => {
      this.iterateParticipantTracks(participant);
    });
    participant.on("trackUnsubscribed", () => {
      this.iterateParticipantTracks(participant);
    });
    this.iterateParticipantTracks(participant);
  };

  participantDisconnected = participant => {
    let { sid: id } = participant;
    this.setState(prevState => {
      return {
        ...prevState,
        tracks: {
          ...prevState.tracks,
          remote: { ...prevState.tracks.remote, [id]: [] }
        }
      };
    });
  };

  iterateLocalParticipantTracks(localParticipant) {
    const tracks = getTracks(localParticipant);
    this.setState(prevState => {
      return { ...prevState, tracks: { ...prevState.tracks, local: tracks } };
    });
  }

  iterateParticipantTracks(participant) {
    const { sid: id } = participant;
    const tracks = getTracks(participant);
    this.setState(prevState => {
      return {
        ...prevState,
        tracks: {
          ...prevState.tracks,
          remote: { ...prevState.tracks.remote, [id]: tracks }
        }
      };
    });
  }

  disconnectCall() {
    if (this.localTrackRoom != null) {
      this.token = null;
      this.setState({ tracks: { remote: {}, local: [] }, disconnected: true });
      this.localTrackRoom.disconnect();
    }
  }

  reconnect() {
    let { token, roomName, initialCamera } = this.props;
    if (token != null) {
      this.connectToTwilio(token, roomName, initialCamera);
      this.setState({ disconnected: false });
    }
  }

  render() {
    let {
      tracks,
      localAudioMute,
      localVideoMute,
      disconnected,
      errorTwilio
    } = this.state;
    let { style } = this.props;
    let { remote, local } = tracks != null ? tracks : { remote: {}, local: [] };
    return (
      <div style={style}>
        <TwilioRemoteAndLocalHolder
          key={this.props.roomName}
          reconnect={this.reconnect.bind(this)}
          showDisconnect={disconnected}
          disconnect={this.disconnectCall.bind(this)}
          remote={remote}
          local={local}
          localAudioMute={localAudioMute}
          cameraStatus={this.props.initialCamera}
          localCameraDisabled={localVideoMute}
          isError={errorTwilio}
        />
      </div>
    );
  }
}

TwilioConnectionManager.propTypes = {
  roomName: propTypes.string.isRequired,
  token: propTypes.string.isRequired,
  initialCamera: propTypes.bool,
  style: propTypes.object.isRequired
};

TwilioConnectionManager.defaultProps = {
  style: {
    border: "1px solid #dcd9d9",
    borderRadius: "4px",
    marginBottom: "15px",
    boxShadow: "5px 5px 5px #e0e3e4",
    fontWeight: "lighter"
  }
};

export default TwilioConnectionManager;
