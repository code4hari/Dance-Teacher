import React, { useState } from 'react';
import Dance1 from '../assets/images/Dance1.png';
import Dance2 from '../assets/images/Dance2.png';
import Dance3 from '../assets/images/Dance3.png';
import image from '../assets/images/dancer.png';
import repeatA from '../assets/images/repeatA.png';
import repeatB from '../assets/images/repeatB.png';
import '../assets/css/landing.css';

function MainPage() {
  const [youtubeLink, setYoutubeLink] = useState('');
  const screenWidth = window.innerWidth;
  const repeatWidth = 9.8;
  const overlap = 0.08;
  const numRepeats = Math.ceil(screenWidth / (repeatWidth * 2 - overlap));

  const handleYoutubeLinkChange = (e) => {
    setYoutubeLink(e.target.value);
  };

  const handleFileChange = (event) => {
    let videoFile = event.target.files[0];

    const formData = new FormData();
    formData.append("video", videoFile);

    fetch("https://b2lffbhv-3000-inspect.use.devtunnels.ms:5000/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        window.location.href = `/danceteacher/learn?data=${data.video_url}`
      })
      .catch((error) => console.error(error));

    
  };

  
  const handleYoutubeLinkSubmit = (e) => {
    if (youtubeLink) {  
      const apiUrl = 'https://b2lffbhv-3000-inspect.use.devtunnels.ms:5000/download';
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeLink }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error(data.error);
          }
          window.location.href = `/danceteacher/learn?data=${data.video_url}`;

        })
        .catch((error) => {
          console.error('Error:', error);
        })
        .finally(() => {
          setYoutubeLink(''); 
        });
    }
  };

  const handleImageButtonClick = (sample_num) => {
    setTimeout(() => {
      window.location.href = `/danceteacher/learn?data=sample${sample_num}`
    }, 10) // 2000 tbd
  };

 

  return (
    <main className="main-page" style={{background: 'black' }}>
     
      (
        <>
          <div className="header">
            <header> Dance </header>
            <header> Teacher </header>
          </div>
          <p id="lower-header" style={{color: 'white'}}><center> Practice dancing for hours without touching your device · No Cloud Server (Everything Running Locally) · Real Time Rendering</center></p>

          <div className="input-container">
            <input
              type="text"
              placeholder="Enter YouTube link"
              className="youtube-input-field"
              value={youtubeLink}
              onChange={handleYoutubeLinkChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleYoutubeLinkSubmit(e);
                }
              }}
            />
            
            <div style={{ margin: '0 10px', fontSize: '18px', color: 'white', alignSelf: 'center', fontFamily: "Roboto", fontWeight: "500", fontStyle: "normal" }}>OR</div>
            <label className="mp4-input-field" htmlFor="mp4-input">
              Choose MP4 File
            </label>
            <input
              type="file"
              accept="video/mp4"
              id="mp4-input"
              className="mp4-input-hidden"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="image-button-container">
            <div style={{ textAlign: 'center', color: 'white', fontSize: '18px', marginBottom: '10px', fontFamily: "Roboto", fontWeight: "500", fontStyle: "normal"}}>
              OR CHOOSE A SAMPLE
            </div>
            <div className="image-buttons">
              <img src={Dance1} alt="Button 1" className="image-button" onClick={() => handleImageButtonClick(1)} />
              <img src={Dance2} alt="Button 2" className="image-button" onClick={() => handleImageButtonClick(2)} />
              <img src={Dance3} alt="Button 3" className="image-button" onClick={() => handleImageButtonClick(3)} />
            </div>
          </div>

          <img
            src={image}
            alt="Dancer"
            style={{ width: '30%', position: 'fixed', bottom: '0px', left: '0px', borderRadius: '40% 40% 0 0' }}
          />
          {[...Array(numRepeats).keys()].map((index) => (
            <React.Fragment key={index}>
              <img
                src={index % 2 === 0 ? repeatB : repeatA}
                alt="Repeat"
                style={{
                  width: `${repeatWidth}%`,
                  position: 'fixed',
                  bottom: '0px',
                  left: `${30 + index * (repeatWidth - overlap)}%`,
                }}
              />
            
            </React.Fragment>
          ))}
        </>
      )
    
    </main>
  );
}

export default MainPage;