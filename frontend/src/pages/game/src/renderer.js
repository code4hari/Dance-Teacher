import * as posedetection from '@tensorflow-models/pose-detection';

import * as params from './params';


const ANCHOR_POINTS = [[0, 0, 0], [0, 1, 0], [-1, 0, 0], [-1, -1, 0]];

const COLOR_PALETTE = [
  '#ffffff', '#800000', '#469990', '#e6194b', '#42d4f4', '#fabed4', '#aaffc3',
  '#9a6324', '#000075', '#f58231', '#4363d8', '#ffd8b1', '#dcbeff', '#808000',
  '#ffe119', '#911eb4', '#bfef45', '#f032e6', '#3cb44b', '#a9a9a9'
];
export class Renderer {
  constructor(canvas, scaleFactor) {
    this.ctx = canvas.getContext('2d');
    this.videoWidth = canvas.width;
    this.videoHeight = canvas.height;
    this.scaleFactor = scaleFactor;
    this.flip(this.videoWidth, this.videoHeight);
  }

  flip(videoWidth, videoHeight) {
    this.ctx.translate(videoWidth, 0);
    this.ctx.scale(-1, 1);
  }

  draw(rendererParams) {
    const [video, poses] = rendererParams;
    this.drawCtx(video);
    if (poses && poses.length > 0) {
      this.drawResults(poses);
    }
  }

  drawCtx(video) {
    this.ctx.drawImage(video, 0, 0, this.videoWidth, this.videoHeight);
  }

  clearCtx() {
    this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight);
  }

  drawResults(poses) {
    for (const pose of poses) {
      this.drawResult(pose);
    }
  }

  drawResult(pose) {
    if (pose.keypoints != null) {
      this.drawKeypoints(pose.keypoints);
      //this.drawSkeleton(pose.keypoints, pose.id);
    }
  }

  drawKeypoints(keypoints) {
    this.ctx.fillStyle = 'Red';
    this.ctx.strokeStyle = 'White';
    this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    for (let i=0; i<keypoints.length; i++) {
      this.drawKeypoint(keypoints[i]);
    }
  }

  drawKeypoint(keypoint) {
    const score = keypoint.score != null ? keypoint.score : 1;
    const scoreThreshold = 0.3;

    if (score >= scoreThreshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x * this.scaleFactor, keypoint.y * this.scaleFactor, params.DEFAULT_RADIUS, 0, 2 * Math.PI);
      this.ctx.fill(circle);
      this.ctx.stroke(circle);
    }
  }

  drawSkeleton(keypoints, poseId) {
    const color = params.STATE.modelConfig.enableTracking && poseId != null ?
        COLOR_PALETTE[poseId % 20] :
        'White';
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    posedetection.util.getAdjacentPairs(params.STATE.model).forEach(([
                                                                      i, j
                                                                    ]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      // If score is null, just show the keypoint.
      const score1 = kp1.score != null ? kp1.score : 1;
      const score2 = kp2.score != null ? kp2.score : 1;
      const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

      if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
        this.ctx.beginPath();
        this.ctx.moveTo(kp1.x, kp1.y);
        this.ctx.lineTo(kp2.x, kp2.y);
        this.ctx.stroke();
      }
    });
  }
}
