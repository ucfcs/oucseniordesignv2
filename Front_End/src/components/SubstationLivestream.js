// Import
import React, { Component } from "react";
import JsmpegPlayer from "./LivestreamPlayer.js";
import icon from "../media/cloud.png";

// Set Video Options
const videoOptions = {
  poster: icon,
};

// Set Overlay Options
const overlayOptions = {};
// Set which server we are trying to connect livestream too using enviroment variables.
const server = process.env.Server || require("./apiCallers/_apiRootAddress");

// Class
class SubstationLivestream extends Component {
  // Render the following html
  render() {
    // If there is no stationID passed, returned error message
    if (!this.props.stationID) return (<div id="Livestream">JSX / HTML Error: no stationID specified</div>);

    //const url = "ws://cloudtracking-v2.herokuapp.com/sub-"+this.props.stationID
    const url = "wss://" + server + "/sub-" +this.props.stationID
    return (
      <div id="Livestream" >
        <h1> Substation {this.props.stationID}</h1>
        <JsmpegPlayer
          wrapperClassName="video-wrapper"
          videoUrl={url}
          options={videoOptions}
          overlayOptions={overlayOptions}
        />
      </div>
    );
  }
}

export default SubstationLivestream;
