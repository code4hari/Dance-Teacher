import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-webgpu';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import * as tf from '@tensorflow/tfjs-core';
import * as posedetection from '@tensorflow-models/pose-detection';
import {STATE} from '../src/params';
import { Camera } from '../src/camera';
import {Renderer} from '../src/renderer';
import sample1Video from '../../../../src/assets/media/sample1.mp4';
import sample2Video from '../../../../src/assets/media/sample2.mp4';
import sample3Video from '../../../../src/assets/media/sample3.mp4';
import obj from '../../../assets/media/sample_json/sample1.json'
import sample1 from '../../../assets/media/sample_json/sample1.json'
import sample2 from '../../../assets/media/sample_json/sample2.json'
import sample3 from '../../../assets/media/sample_json/sample3.json'

let modelType, camera, detector, renderer;

  
  function dotProduct(vector1, vector2) {
    const dot = vector1[0] * vector2[0] + vector1[1] * vector2[1];
    const magnitude1 = Math.sqrt(vector1[0] ** 2 + vector1[1] ** 2);
    const magnitude2 = Math.sqrt(vector2[0] ** 2 + vector2[1] ** 2);
    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0; 
    }
    const cosineSimilarity = dot / (magnitude1 * magnitude2);
    return cosineSimilarity; 
  }
  
  
  function addVectors(vector1, vector2) {
    return [vector1[0] + vector2[0], vector1[1] + vector2[1]];
  }


  function hasNonZeroElement(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== 0) {
        return true;
      }
    }
    return false;
  }

  
tfjsWasm.setWasmPaths(
    `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${
        tfjsWasm.version_wasm}/dist/`);

tf.setBackend('webgl');

let startTime = new Date().getTime();

let threshold = 0;
let previousMovementDifference = 10;
let currentVector = [];

let previous_poses = [[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]]

let curr_position_start = 0;
let curr_position_start2 = 0;

for (let i=0; i<=16; i++) {
    currentVector.push([0, 0]);
}

let dotProducts = Array(17).fill(-1).map(() => Array(obj[0].length).fill(-1));

let final_vectors = [];

let originA = -1;

let poses = null;
let started = false;
let lastRedTime = new Date().getTime() / 1000;



async function renderResult() {
    if (camera.video.readyState < 2) {
        await new Promise((resolve) => {
            camera.video.onloadeddata = () => {
                resolve(camera.video);
            };
        });
    }

    if (!started) {
        let mmm = document.getElementById("input-video");
        let canvasAA = document.getElementById('output');

        console.log(camera.video.height);

       // canvasAA.width = mmm.videoWidth;
       // canvasAA.height = mmm.videoHeight;
        started = true;

    }
    let video = camera.video;
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let x = document.getElementById("input-video");
    if (x.ended) {
        startTime = (new Date().getTime() - startTime) / 1000;
        x.currentTime = 0;
        x.play();
        originA = -1;
    }


    if (detector != null) {
        try {
            poses = await detector.estimatePoses(
                camera.video,
                {flipHorizontal: true});
        } catch (error) {
          detector.dispose();
          detector = null;
        }
    }


    if (poses.length == 0) return;

    let active = [];
    [5, 6, 11, 12].forEach((idx) => {
        if (poses[0].keypoints[idx].score > threshold) active.push(idx);
    });

    let origin, destination;
    if (active.includes(5) && active.includes(12)) {
        origin = poses[0].keypoints[5];
        destination = poses[0].keypoints[12];
    } else if (active.includes(6) && active.includes(11)) {
        origin = poses[0].keypoints[6];
        destination = poses[0].keypoints[11];
    } else {
        for(let i=0; i<=16; i++ ){
            if (i === 5 || i === 6 || i === 11 || i === 12) {
                continue;
            }
        }
        return; 
    }


    let midpoint = [(origin.x + destination.x)/2, (origin.y + destination.y)/2];
    let movementDifference = Math.abs(origin.y - destination.y) / 6;
    previousMovementDifference = movementDifference;

    for(let idx=0; idx<poses[0].keypoints.length; idx++) {
        if (idx === 5 || idx === 6 || idx === 11 || idx === 12) {
            continue;
        }
        let curr_pose = poses[0].keypoints[idx];
        if (curr_pose.score < threshold) {
        } else {
           /*let modified = false;
            if (Math.abs(curr_pose.x - previous_poses[idx][0]) > previousMovementDifference) {
                previous_poses[idx] = [curr_pose.x, previous_poses[idx][1]];
                modified = true;
            } 
            if (Math.abs(curr_pose.y - previous_poses[idx][1]) > previousMovementDifference) {
                previous_poses[idx] = [previous_poses[idx][0], curr_pose.y];
                modified = true;
            } 

            if (modified) {
                let currNormalized = [curr_pose.x - midpoint[0], midpoint[1] - curr_pose.y];
                currentVector[idx] = currNormalized;
            }*/
            let currNormalized = [curr_pose.x - midpoint[0], midpoint[1] - curr_pose.y];
            currentVector[idx] = currNormalized;
        }
    }

    for(let i=0; i<=16; i++) {
        if (i < 7 || i === 11 || i === 12) {
            continue;
        }
        
        for(let j=0; j<obj[i].length; j++) {
            if (currentVector[i][0] != 0 && currentVector[i][1] != 0) {
                // let dot = dotProduct(currentVector[i], obj[i][j]);
                let dot = dotProduct(currentVector[i], obj[i][j]);
                dotProducts[i][j] = dot;
            }
        }
    }

    let timeVideoIsAt = document.getElementById("input-video").currentTime;
    let roundedTime = Math.round(timeVideoIsAt * 10) / 10;
    roundedTime = roundedTime * 10;


    let prefix = 4;
    let suffix = 4;
    let mm = Math.max(roundedTime - prefix, 0);
    let gg = Math.min(roundedTime + suffix, parseInt(document.getElementById("input-video").duration * 10))
   

    let satisfied = false;
    for (let jj = mm; jj < gg; jj++) {
        let safe = true;
        for(let t=9; t<=16; t++) {
            if (t >= 11 && t <= 14) continue;
            if (dotProducts[t][jj] < 0.5  && dotProducts[t][jj] != -1 && dotProducts[t][jj] != 0) {
                safe = false;
                break;
            }
        }
        if (safe) {
            satisfied = true;
            break;
        }
    }

    let currTime = new Date().getTime() / 1000;
    if (!(satisfied)) {
        
        if (currTime - lastRedTime > 0.75) {
            document.getElementsByTagName("body")[0].style.backgroundColor = "lightblue";
            let sum_arr_process = [];
            for (let kk=0; kk < dotProducts[14].length; kk++) {
                let curr_sum = 0;
                for(let t=9; t<=16; t++) {
                    if (t >= 11 && t <= 14) continue;
                    if (dotProducts[t][kk] != -1 && dotProducts[t][kk] != 0) {
                        curr_sum += dotProducts[t][kk]
                    }
                }
                sum_arr_process.push(curr_sum);
            }

            let arr = sum_arr_process;
            const maxValue = Math.max(...arr);
            console.log(maxValue);
            const index = arr.indexOf(maxValue);
            document.getElementById("input-video").currentTime = index/10;
            lastRedTime = currTime;
            
        }
        
    }  else {
        document.getElementsByTagName("body")[0].style.backgroundColor = "green";
        lastRedTime = currTime;
    }
    




    dotProducts = Array(17).fill(-1).map(() => Array(obj[0].length).fill(-1));

    /*
    // SHI IS COOKED
    if (currentTime - curr_position_start > 0.1) {
            for(let i=0; i<=16; i++) {
                if (i < 6 || i === 11 || i === 12) {
                    continue;
                }
                
                for(let j=0; j<obj[i].length; j++) {
                    if (currentVector[i][0] != 0 && currentVector[i][1] != 0) {
                        let curr_pose = poses[0].keypoints[i];
                        let currNormalized = [curr_pose.x - midpoint[0], midpoint[1] - curr_pose.y];
                        // let dot = dotProduct(currentVector[i], obj[i][j]);
                        let dot = dotProduct(currNormalized, obj[i][j]);
                        dotProducts[i][j] = dot;
                        continue;
                    }
                }
            }


            curr_position_start = currentTime;

            for(let i=0; i<=16; i++) {
                currentVector[i] = [0, 0];
            }

         

            let timeVideoIsAt = document.getElementById("input-video").currentTime;
            let roundedTime = Math.round(timeVideoIsAt * 100) / 10;
            roundedTime = roundedTime * 10;
       

            let prefix = 10;
            let suffix = 5;
            let mm = Math.max(roundedTime - prefix, 0);
            let gg = Math.min(roundedTime + suffix, parseInt(document.getElementById("input-video").duration * 100))
           

            let satisfied = false;

            
            for (let jj = mm; jj < gg; jj++) {
                let safe = true;
                for(let t=7; t<=16; ++t) {
                    if (dotProducts[t] == undefined || t == 11 || t == 12) continue;
                    if (dotProducts[t][jj] < 0) {
                        safe = false;
                    }
                }
                if (safe) {
                    satisfied = true;
                }
            }

            if (!(satisfied)) {
               // console.log(dotProducts)
                console.log("YIKES")
               // console.log(roundedTime)
            } 
            



            **
            if (currentTime - curr_position_start2 > 0.2) {
                let main_arr = []
                for(let m=0; m<=16; m++) {
                    let newArr = [];
                    let n = dotProducts[m];
                    for (let i = 0; i < n.length; i += 5) {
                        let sum = n.slice(i, i + 5).reduce((acc, curr) => acc + curr, 0);
                        newArr.push(sum);
                    }
                    main_arr.push(newArr);
                }
                

                let flattenedDotProducts = new Array(main_arr[0].length).fill(0);
                for (let i = 0; i < main_arr.length; i++) {
                    for (let j = 0; j < main_arr[i].length; j++) {
                        flattenedDotProducts[j] += main_arr[i][j];
                    }
                }
                let arr = flattenedDotProducts;
                let maxIndex = arr.reduce((maxIdx, currValue, currIdx, array) => 
                    currValue > array[maxIdx] ? currIdx : maxIdx, 0);
                
                    let top5Indices = [...arr.keys()]
                        .sort((a, b) => arr[b] - arr[a]) // Sort indices based on their corresponding values in descending order
                        .slice(0, 5); // Take the top 5 indices
                    
                    final_vectors.push(top5Indices);
            
                dotProducts = Array(17).fill(0).map(() => Array(obj[0].length).fill(0));

                curr_position_start2 = currentTime;
            }


            if (final_vectors.length == 5) {
            // calculation algorithm
            let d = {};
            for(let i=0; i<5; i++) {
                for(let j=0; j<5; j++) {
                    let key1 = final_vectors[i][j] - 1;
                    let key2 = final_vectors[i][j];
                    let key3 = final_vectors[i][j] + 1;
                    let key4 = final_vectors[i][j] + 2;
                    let key5 = final_vectors[i][j] - 2;
                    
                    if (d[key1] === undefined) {
                        d[key1] = 2;
                    } else {
                        d[key1] += 2;
                    }
                    
                    if (d[key2] === undefined) {
                        d[key2] = 3;
                    } else {
                        d[key2] += 3;
                    }
                    
                    if (d[key3] === undefined) {
                        d[key3] = 2;
                    } else {
                        d[key3] += 2;
                    }

                    if (d[key4] === undefined) {
                        d[key4] = 1;
                    } else {
                        d[key4] += 1;
                    }

                    if (d[key4] === undefined) {
                        d[key4] = 1;
                    } else {
                        d[key4] += 1;
                    }
                }

                // if +/- 2 in atleast 3/5 we continue, else we recalibrate to most popular position
            }
            let maxKey = Object.keys(d).reduce((a, b) => d[a] > d[b] ? a : b);
            maxKey = parseInt(maxKey) + 2;
            let beliefTime = parseInt(maxKey);
            if (originA == -1) {
                originA = beliefTime;
            } else {
                let supposedToBeTime = originA + 2.22;
                if (Math.abs(supposedToBeTime - beliefTime) <= 3) {
                    originA = supposedToBeTime;
                } else {
                    let middy = supposedToBeTime - 2;
                    let count = 0;
                    for (let r = 0; r < 5; r++ ) {
                        let done = false;
                        for(let rr = 0; rr < 5; rr++) {
                            if (done) continue;
                            let dd = final_vectors[r][rr];
                            if (Math.abs(dd - middy) < 3) {
                                count++;
                                done = true;
                            }
                        }
                    }
                    if (count >= 1) {
                        console.log("WE PASS HERE1");
                        originA = supposedToBeTime;
                    } else {
                        // cooked
                        document.getElementById("input-video").currentTime = parseInt(maxKey);
                        console.log("CHANGE")
                        originA = supposedToBeTime;
                    }
                }

            }
          
            //console.log(`We believe the time is ${originA/2} and time really is ${document.getElementById("input-video").currentTime}`)
            
            **





            final_vectors = [];
        }
*/
        

        }





export async function startModule() {
    await tf.ready();
    modelType = posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING;
    const modelConfig = {modelType};

    camera = await Camera.setup(STATE.camera);
    
    detector = await posedetection.createDetector("MoveNet", modelConfig);

    const canvas = document.getElementById('output');

    const isLandscape = camera.video.width > camera.video.height;
    const scaleFactor = isLandscape ? window.innerHeight / camera.video.height : window.innerWidth / camera.video.width;

    canvas.width = camera.video.width * scaleFactor;
    canvas.height = camera.video.height * scaleFactor;

    canvas.style.left = isLandscape ? (window.innerWidth - canvas.width) / 2 + "px" : "";
    canvas.style.top = isLandscape ? "" : (window.innerHeight - canvas.height) / 2 + "px";

    
    renderer = new Renderer(canvas, scaleFactor);
}

export async function renderPrediction() {
    await renderResult();
    let rafId = requestAnimationFrame(renderPrediction);
}

export async function chooseTask(setLoading) {
    try {
        const params = new URLSearchParams(window.location.search);

        let taskOption = params.get('data');
    
        if (taskOption.startsWith("sample")) {
            setTimeout(async () => {
                if (taskOption == "sample1") {
                    renderStart(setLoading, sample1,sample1Video)
                } else if (taskOption == "sample2") {
                    renderStart(setLoading, sample2,sample2Video)
                } else if (taskOption == "sample3") {
                    renderStart(setLoading, sample3,sample3Video)
                } else {
                    window.location.href = "/danceteacher"
                }
                
            }, 20) // change this to 2000 later to fake processing lmao
        } else if (taskOption.startsWith("https://b2lffbhv-3000-inspect.use.devtunnels.ms:5000/")) {
            gatherData(taskOption, setLoading);
        } else {
            window.location.href = "/danceteacher"
        }
    } catch (e) {
        window.location.href = "/danceteacher"
    }
}

async function gatherData(url, setLoading) {
    let videoExtractedData = [];

    /* Pre Processing Algorithm */
    const videoFFT = document.createElement('video');
  //  videoFFT.style.display = 'none';
    videoFFT.id = 'video';
    videoFFT.muted = true;
    videoFFT.playsInline = true;
    videoFFT.width = 640;
    videoFFT.height = 480;
    videoFFT.style.display = "none";
    videoFFT.crossOrigin = "anonymous";

    const source = document.createElement('source');
    source.src = url;

    videoFFT.appendChild(source);
    document.getElementsByTagName("body")[0].appendChild(videoFFT);
    

    const canvasFFT = document.createElement("canvas")
    const ctxFFT = canvasFFT.getContext('2d');
    let videoWidth;
    let videoHeight;
    let normalized_arr = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[], []];
    let initalized = false;
    

    async function init() {
        async function render() {
            try {
                if (videoFFT.currentTime >= videoFFT.duration) {
                    videoExtractedData = normalized_arr;
                    renderStart(setLoading, videoExtractedData, url);
                    return;
                }
                
                ctxFFT.clearRect(0, 0, canvasFFT.width, canvasFFT.height);
                ctxFFT.drawImage(videoFFT, 0, 0, canvasFFT.width, canvasFFT.height);
                
                if (detector != null) {
                    try {
                        poses = await detector.estimatePoses(
                            videoFFT);
                    } catch (error) {
                      detector.dispose();
                      detector = null;
                    }
                }
                
                if (poses.length == 0)  {
                    requestAnimationFrame(render);
                    return;
                }
                

                if (videoFFT.currentTime < 1 && !initalized) {
                    requestAnimationFrame(render);
                    return;
                }
                if (!initalized) {
                    videoFFT.currentTime = 0;
                }
                initalized = true;
                
                let origin = poses[0].keypoints[5];
                let destination = poses[0].keypoints[12];

                let midpoint = [(origin.x + destination.x)/2, (origin.y + destination.y)/2];
                let movementDifference = Math.abs(origin.y - destination.y) / 6;

                previousMovementDifference = movementDifference;

                for(let idx=0; idx<poses[0].keypoints.length; idx++) {
                    if (idx < 6 || idx === 11 || idx === 12) {
                        normalized_arr[idx].push([0, 0]);
                        continue;
                    }
                    let curr_pose = poses[0].keypoints[idx];
                    normalized_arr[idx].push([curr_pose.x - midpoint[0], midpoint[1] - curr_pose.y])
                }

                ctxFFT.beginPath();
                ctxFFT.arc(midpoint[0], midpoint[1], 20, 0, 2 * Math.PI);
                ctxFFT.fillStyle = 'green';
                ctxFFT.fill();

                poses[0].keypoints.forEach((keypoint, idx) => {
                    if (!(idx === 5 || idx === 6 || idx === 11 || idx === 12)) {
                        return
                    }
                    ctxFFT.beginPath();
                    ctxFFT.arc(keypoint.x, keypoint.y, 10, 0, 2 * Math.PI);
                    ctxFFT.fillStyle = 'red';
                    ctxFFT.fill();
                });
                videoFFT.currentTime += 0.1;
                requestAnimationFrame(render);
            } catch(e) {
                console.log(e);
            }
        }
        videoFFT.play();
        render();
    }


    videoFFT.addEventListener('loadeddata', () => {
       
        videoWidth = videoFFT.videoWidth;
        videoHeight = videoFFT.videoHeight;
        canvasFFT.width = videoWidth;
        canvasFFT.height = videoHeight;
        init();
    });

    videoFFT.load();



    // return 
}

function renderStart(setLoading, data, url) {
    console.log("here")
    document.getElementById('ahhh').src = url;
    document.getElementById('input-video').load();
    obj = data;

    setLoading(false);
    // need to call render
    renderPrediction();

}

export async function renderUpload(setUploadView) {
    setUploadView(true);
}
