import React, { useEffect, useState} from 'react';
import { startModule, chooseTask } from '../src/main';
import '../../../assets/css/learn.css';
const Learn = () => {
  const [loading, setLoading] = useState(true);

  startModule().then(() => {
    chooseTask(setLoading);
  })

  return (
    <>
    
  
  <div
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      display: !loading ? 'none' : 'block',
      
    }}
  >
    <div className="loader"></div>
    <div
      style={{
        fontSize: '36px',
        color: 'white',
        marginTop: '20px',
        fontWeight: "500",
        fontstyle: "normal"
      }}
      id="processing-video"
    >
      Processing Video
    </div>
  </div>

  <div id="main" >
  <div className="container">
    <div className="canvas-wrapper">
      <canvas id="output" style={{position: "fixed", display: 'none'}}> </canvas>
      <video
        id="input-video"
        muted
        playsInline
        autoPlay
        style={{
          WebkitTransform: 'scaleX(-1)',
          transform: 'scaleX(-1)',
          visibility: loading ? 'hidden' : 'initial',
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          maxHeight: '100vh',
          margin: 'auto', // Center the video
          position: 'fixed',
           transform: 'rotateY(180deg)' // Center the video
        }}
      >
        <source src="a.mp4" id="ahhh" type="video/mp4" />
      </video>
      <video
        id="video"
        playsInline
        style={{
          WebkitTransform: 'scaleX(-1)',
          transform: 'scaleX(-1)',
          visibility: 'hidden',
          width: 'auto',
          height: 'auto',
        }}
      />

    </div>
  </div>
</div>

</>
     
  );
};

export default Learn;