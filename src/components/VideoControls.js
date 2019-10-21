import React, {Component} from 'react';
import propTypes from 'prop-types';

let mute = require('../images/mute.png');
let unmute = require('../images/unmute.png');
let camera = require('../images/camera.png');
let uncamera = require('../images/uncamera.png');
let disconnect = require('../images/disconnect.png');
let reconnectIcon = require('../images/reconnect.png');
let closeIcon = require('../images/error.png');
let showBar = require('../images/showBar.png');

class VideoControls extends Component {
  constructor(props) {
    super(props);
    this.state = {localAudioMute: false, localCameraDisabled: false};
    this.videoControlStyle = {
      height: '50px',
      width: '100%',
      left: '25%',
      position: 'relative',
      display: 'block',
      top:'-50px',
      marginLeft: '50%',
      transform: 'translateX(-45%)',
    };
    this.imageWrapperStryle = {
      height: '40px',
      width: '40px',
      background: 'rgba(243,238,238,0.5)',
      borderRadius: '50%',
      float: 'left',
      marginLeft: '5px'
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      localAudioMute: nextProps.localAudioMute
    })
  }

  render() {
    let {localAudioMute, localCameraDisabled} = this.state;
    let {disconnectCall} = this.props;
    let controlChildStyle = {margin: '13%', width: '30px', height: '30px'}
    let {imageWrapperStryle} = this;
    return (
      <div style={this.videoControlStyle}>
        <div style={imageWrapperStryle}>
          <img style={controlChildStyle} onClick={() => {
            this.props.localAudioToggle();
            this.setState((prevState) => {
              return {...prevState, localAudioMute: !prevState.localAudioMute}
            })
          }} src={localAudioMute ? mute : unmute}/>
        </div>
        {this.props.cameraStatus ?
          <div style={imageWrapperStryle}>
            <img style={controlChildStyle} onClick={() => {
              this.props.localCameraToggle();
              this.setState((prevState) => {
                return {...prevState, localCameraDisabled: !prevState.localCameraDisabled}
              })
            }} src={localCameraDisabled ? uncamera : camera}/>
          </div> : ''
        }
        <div style={{...imageWrapperStryle, background: 'rgba(255,0,0,0.8)'}}>
          <img style={controlChildStyle} onClick={() => {
            disconnectCall();
          }} src={disconnect}/>
        </div>
      </div>
    )
  }

}

export default VideoControls;