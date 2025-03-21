const video = document.getElementById("video");
const startCameraBtn = document.getElementById("startCamera");
const startDetectionBtn = document.getElementById("startDetection");
const toggleDetection = document.getElementById("toggleDetection");
const toggleLandmarks = document.getElementById("toggleLandmarks");
const toggleExpressions = document.getElementById("toggleExpressions");
const statusText = document.getElementById("status");

// ✅ Load face-api.js models
async function loadModels() {
    try {
        console.log("Loading face-api.js models...");

        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
            // faceapi.nets.faceLandmark68TinyNet.loadFromUri('./models'), 
            faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
            faceapi.nets.faceExpressionNet.loadFromUri('./models')
        ]);

        console.log("Models loaded successfully!");
        statusText.innerText = "Models loaded. Start the camera.";
        startCameraBtn.disabled = false;
    } catch (error) {
        console.error("Error loading models:", error);
        statusText.innerText = "Error loading models. Check console.";
    }
}


async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
        statusText.innerText = "Camera started. Click 'Start Detection'.";
        startDetectionBtn.disabled = false; 
    } catch (err) {
        console.error("Error accessing webcam:", err);
        statusText.innerText = "Camera access denied.";
    }
}


async function startFaceDetection() {
    if (!faceapi.nets.tinyFaceDetector.isLoaded ||
        !faceapi.nets.faceLandmark68Net.isLoaded ||
        !faceapi.nets.faceRecognitionNet.isLoaded ||
        !faceapi.nets.faceExpressionNet.isLoaded) {
        console.error("Error: Models not loaded yet!");
        statusText.innerText = "Error: Models not fully loaded!";
        return;
    }

    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);
    statusText.innerText = "Detecting faces...";

    setInterval(async () => {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        if (toggleDetection.checked) {
            faceapi.draw.drawDetections(canvas, resizedDetections);
        }
        if (toggleLandmarks.checked) {
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }
        if (toggleExpressions.checked) {
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        }
    }, 100);
}



startCameraBtn.addEventListener("click", () => {
    startCameraBtn.disabled = true;
    startVideo();
});

startDetectionBtn.addEventListener("click", () => {
    startDetectionBtn.disabled = true;
    startFaceDetection();
});


window.onload = async function () {
    await loadModels();
    console.log("All models are now loaded.");
};

