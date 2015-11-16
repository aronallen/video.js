/**
 * @file hls.js
 * VideoJS-HLS.JS - hooks for Dailymotion HLS JS.
 * https://github.com/dailymotion/hls.js
 */


import * as Dom from '../utils/dom.js';
import * as Url from '../utils/url.js';
import { createTimeRange } from '../utils/time-ranges.js';
import Hls from 'hls.js';
import Component from '../component';
import window from 'global/window';
import document from 'global/document';
import assign from 'object.assign';
import Tech from './tech.js';
import Html5 from './html5.js';
import {bind} from '../utils/fn';

let navigator = window.navigator;

class Hlsjs extends Tech {

  constructor(options, ready){
    super(options, ready);

  }

  createEl() {
    this.hls_ = new Hls();
    this.el_ = Html5.prototype.createEl.apply(this, arguments);


    this.hls_.on(Hls.Events.MSE_ATTACHED, bind(this, this.onMseAttached));
    this.hls_.on(Hls.Events.MANIFEST_PARSED, bind(this, this.onManifestParsed));
    this.hls_.on(Hls.Events.ERROR, bind(this, this.onError));

    this.hls_.attachVideo(this.el_);
    this.hls_.loadSource(this.options_.source.src);


    this.el_.tech = this;
    return this.el_;
  }

  onMseAttached() {
    this.triggerReady();
  }

  onManifestParsed() {
    if (this.player().options().autoplay) {
      this.player().play();
    }
  }



  onError (event, data) {
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          // try to recover network error
          this.log('fatal network error encountered, try to recover');
          this.hls_.recoverNetworkError();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          this.log('fatal media error encountered, try to recover');
          this.hls_.recoverMediaError();
          break;
        default:
          // cannot recover
          this.hls_.destroy();
          this.error(data);
          break;
      }
    }
    switch (data.details) {
      case Hls.ErrorDetails.MANIFEST_LOAD_ERROR:
      case Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT:
      case Hls.ErrorDetails.MANIFEST_PARSING_ERROR:
      case Hls.ErrorDetails.LEVEL_LOAD_ERROR:
      case Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT:
      case Hls.ErrorDetails.LEVEL_SWITCH_ERROR:
      case Hls.ErrorDetails.FRAG_LOAD_ERROR:
      case Hls.ErrorDetails.FRAG_LOOP_LOADING_ERROR:
      case Hls.ErrorDetails.FRAG_LOAD_TIMEOUT:
      case Hls.ErrorDetails.FRAG_PARSING_ERROR:
      case Hls.ErrorDetails.FRAG_APPENDING_ERROR:
        this.log(data.type);
        this.log(data.details);
        break;
      default:
        break;
    }

  }

  dispose () {
    this.hls_.destroy();
    return super();
  }



}

Hlsjs.prototype.currentTime = Html5.prototype.currentTime;
Hlsjs.prototype.play = Html5.prototype.play;
Hlsjs.prototype.volume = Html5.prototype.volume;
Hlsjs.prototype.duration = function () {
  return (this.options().live) ? Infinity : Html5.prototype.duration.apply(this, arguments);
};
Hlsjs.prototype.muted = Html5.prototype.muted;
Hlsjs.prototype.setMuted = Html5.prototype.setMuted;
Hlsjs.prototype.setVolume = Html5.prototype.setVolume;
Hlsjs.prototype.paused = Html5.prototype.paused;
Hlsjs.prototype.pause = Html5.prototype.pause;
Hlsjs.prototype.setCurrentTime = Html5.prototype.setCurrentTime;
Hlsjs.prototype.seeking = Html5.prototype.seeking;
Hlsjs.prototype.seekable = Html5.prototype.seekable;
Hlsjs.prototype.scrubbing = Html5.prototype.scrubbing;
Hlsjs.prototype.seekable = Html5.prototype.seekable;
Hlsjs.prototype.getPercent = Html5.prototype.getPercent;
Hlsjs.prototype.getCache = Html5.prototype.getCache;

Hlsjs.isSupported = function(){
  return Hls.isSupported();
};
Hlsjs.canPlaySource = function (techId, source) {
  if (Html5.canPlaySource(techId, source)) {
    return false;
  } else {
    return Hls.isSupported();
  }
};
Hlsjs.canControlVolume = function () {
  return true;
};




Component.registerComponent('Hlsjs', Hlsjs);
Tech.registerTech('Hlsjs', Hlsjs);
window.Tech = Tech;
export default Hlsjs;
