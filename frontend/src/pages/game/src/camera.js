import * as params from './params';
import {isMobile} from './util';

export class Camera {
  constructor() {
    this.video = document.getElementById('video');
  }

  static async setup(cameraParam) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const {targetFPS, sizeOption} = cameraParam;
    const $size = params.VIDEO_SIZE[sizeOption];
    const videoConfig = {
      'audio': false,
      'video': {
        facingMode: 'user',
        width: isMobile() ? params.VIDEO_SIZE['360 X 270'].width : $size.width,
        height: isMobile() ? params.VIDEO_SIZE['360 X 270'].height :
                             $size.height,
        frameRate: {
          ideal: targetFPS,
        }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);

    const camera = new Camera();
    camera.video.srcObject = stream;

    await new Promise((resolve) => {
      camera.video.onloadedmetadata = () => {
        resolve(camera.video);
      };
    });

    camera.video.play();

    const videoWidth = camera.video.videoWidth;
    const videoHeight = camera.video.videoHeight;
    camera.video.width = videoWidth;
    camera.video.height = videoHeight;

    const canvasContainer = document.querySelector('.canvas-wrapper');
    canvasContainer.style = {
        width: `${videoWidth}px`,
        height: `${videoHeight}px`
    };

    return camera;
  }
}
