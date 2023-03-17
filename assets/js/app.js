// declare global variable
let video = null; // video element
let detector = null; // detector object
let detections = []; // store detection result
let videoVisibility = true;
let detecting = false;
let speachEnabled = true;

// global HTML element
const toggleVideoEl = document.getElementById('toggleVideoEl');
const toggleDetectingEl = document.getElementById('toggleDetectingEl');
const countEl = document.getElementById('countEl'); 
const toggleSpeakingEl = document.getElementById('toggleSpeakingEl'); 
// set cursor to wait until video elment is loaded
document.body.style.cursor = 'wait';

// The preload() function if existed is called before the setup() function
function preload() {
    // create detector object from "cocossd" model
    detector = ml5.objectDetector('cocossd');
  }
  
  // The setup() function is called once when the program starts.
  function setup() {
    // create canvas element with 640 width and 480 height in pixel
    // createCanvas(640, 480);
    var canvas = createCanvas(640, 480);

    // add CSS styling to center align canvas
    canvas.style('display', 'block');
    canvas.style('margin', '90px auto 0 auto');
    canvas.style('border', '5px solid #ffffff')
    
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    video.elt.addEventListener('loadeddata', function() {
      // set cursor back to default
      if (video.elt.readyState >= 2) {
        document.body.style.cursor = 'default';
      }
    });

  }

  function toggleVideo() {
    if (!video) return;
    if (videoVisibility) {
      video.hide();
      toggleVideoEl.innerText = 'Show Video';
    } else {
      video.show();
      toggleVideoEl.innerText = 'Hide Video';
    }
    videoVisibility = !videoVisibility;
  }
  
  function toggleDetecting() {
    if (!video || !detector) return;
    if (!detecting) {
      detect();
      toggleDetectingEl.innerText = 'Stop Detecting';
      toggleSpeakingEl.innerText = 'Mute';
      speachEnabled = true;
    } else {
      toggleDetectingEl.innerText = 'Start Detecting';
      toggleSpeakingEl.innerText = 'Unmute';
      speachEnabled = false;
    }
    detecting = !detecting;
  }

  function toggleTextToSpeech() {
    if (!speachEnabled)
    {
        toggleSpeakingEl.innerText = 'Mute';
    } else {
        toggleSpeakingEl.innerText = 'Unmute';
    }
    speachEnabled = !speachEnabled;
  }

  function detect() {
    // instruct "detector" object to start detect object from video element
    // and "onDetected" function is called when object is detected
    detector.detect(video, onDetected);
  }
  
  // callback function. it is called when object is detected
  function onDetected(error, results) {
    if (error) {
      console.error(error);
    }
    detections = results;

    countEl.innerText = detections.length; // update count element
    
    if(!speachEnabled && 'speechSynthesis' in window)
    {
        window.speechSynthesis.cancel();
    }
    
    if (speachEnabled && 'speechSynthesis' in window) {
      if (detections.length === 1) {
        const message = new SpeechSynthesisUtterance(`one object is detected`);
        window.speechSynthesis.speak(message);
      } else {
        const message = new SpeechSynthesisUtterance(`${detections.length} objects are detected`);
        window.speechSynthesis.speak(message);
      }
    }
    
    // keep detecting object
    if (detecting) {
      detect(); 
    }
  }

  // the draw() function continuously executes until the noLoop() function is called
  function draw() {
      if (!video || !detecting) return;
      // draw video frame to canvas and place it at the top-left corner
      image(video, 0, 0);
      // draw all detected objects to the canvas
      for (let i = 0; i < detections.length; i++) {
        drawResult(detections[i]);
      }
    }
  
  function drawResult(object) {
    drawBoundingBox(object);
    drawLabel(object);
  }
  
  // draw bounding box around the detected object
  function drawBoundingBox(object) {
    // Sets the color used to draw lines.
    stroke('EE51CB');
    // width of the stroke
    strokeWeight(4);
    // Disables filling geometry
    noFill();
    // draw an rectangle
    // x and y are the coordinates of upper-left corner, followed by width and height
    rect(object.x, object.y, object.width, object.height);
  }
  
  // draw label of the detected object (inside the box)
  function drawLabel(object) {
    // Disables drawing the stroke
    noStroke();
    // sets the color used to fill shapes
    fill('white');
    // set font size
    textSize(24);
    // draw string to canvas
    text(object.label, object.x + 10, object.y + 24);
  }