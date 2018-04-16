import React, { Component } from 'react';
import TwilioRemoteAndLocalHolder from './TwilioRemoteAndLocalHolder';
import propTypes from 'prop-types';
const Video = require('twilio-video');


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
    this.localTrackRoom.localParticipant.tracks.forEach(track => track.stop());
  }

  async connectToTwilio(token, roomName, initialCamera) {

    const tracks = await Video.createLocalTracks({audio: true, video: initialCamera});
    const room = await Video.connect(token, { tracks }).then((roomConnection) => {
      this.localTrackRoom = roomConnection;
      this.setState((prevState) => { return { ...prevState, currentRoom: room }});
      this.iterateLocalParticipantTracks(roomConnection.localParticipant);
      roomConnection.participants.forEach(this.participantConnected);
      roomConnection.on('participantConnected', this.participantConnected);
      roomConnection.on('participantDisconnected', this.participantDisconnected);
      roomConnection.once('disconnected', error => roomConnection.participants.forEach(this.participantDisconnected));
    }, (err) => {
      console.log(err);
    });
  }

  participantConnected = (participant) => {
    participant.on('trackAdded', track => this.trackAdded(track, participant));
    participant.on('trackRemoved', track => this.trackRemoved(participant));
  };

  participantDisconnected = (participant) =>{
    let { sid: id } = participant;
    this.setState((prevState) => {
      return {
        ...prevState, tracks: { ...prevState.tracks, remote: { ...prevState.tracks.remote, [id]: [] } }
      }
    })
  };

  iterateLocalParticipantTracks(localParticipant) {
    let tracks = [];
    localParticipant.audioTracks.forEach((track, trackId) => {
      track.isAudio = true;
      return tracks.push(track);
    });
    localParticipant.videoTracks.forEach((track, trackId) => {
      track.isAudio = false;
      if (track.dimensions.width != null && track.dimensions.height != null) {
        return tracks.push(track);
      }
    });
    this.setState((prevState) => {
      return { ...prevState, tracks: { ...prevState.tracks, local: tracks } }
    });
  }


  iterateParticipantTracks(participant) {
    let tracks = [];
    let { sid: id } = participant;
    participant.audioTracks.forEach((track, trackId) => {
      track.isAudio = true;
      tracks.push(track);
    });
    participant.videoTracks.forEach((track, trackId) => {
      track.isAudio = false;
      if (track.dimensions.width != null && track.dimensions.height != null) {
        tracks.push(track);
      }
    });
    this.setState((prevState) => {
      return { ...prevState, tracks: { ...prevState.tracks, remote: { ...prevState.tracks.remote, [id]: tracks } } }
    });
  }

  trackAdded(track, participant) {
    track.on('enabled', () => {
      this.iterateParticipantTracks(participant);
    });
    track.on('started', () => {
      this.iterateParticipantTracks(participant);
    });
    track.on('disabled', () => {
      this.iterateParticipantTracks(participant);
    });
    this.iterateParticipantTracks(participant);
  }

  trackRemoved(participant) {
    this.iterateParticipantTracks(participant);
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
    let { tracks, localAudioMute, localVideoMute, disconnected, errorTwilio } = this.state;
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
          isError={errorTwilio} />
      </div>
    )
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
    border: '1px solid #dcd9d9',
    borderRadius: '4px',
    marginBottom: '15px',
    boxShadow: '5px 5px 5px #e0e3e4',
    fontWeight: 'lighter'
  }
};

export default TwilioConnectionManager;