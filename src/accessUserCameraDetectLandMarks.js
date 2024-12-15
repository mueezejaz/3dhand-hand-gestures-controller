import { loadModel } from "./handLandMarkDetection";
import { detectFunction } from "./handLandMarkDetection";

async function requestCameraAccess() {
  try {
    // Attempt to access the camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    if (stream) {
      const videoElem = document.createElement("video");
      videoElem.srcObject = stream;

      // Flip the video horizontally if needed
      // videoElem.style.transform = "scaleX(-1)";

      // Return a Promise that resolves when the video is fully loaded
      return new Promise((resolve) => {
        videoElem.onloadeddata = () => {
          videoElem.play();
          console.log("Camera access granted");
          resolve(videoElem); // Resolve with the video element
        };
      });
    }
  } catch (error) {
    // If access is denied or an error occurs
    if (error.name === "NotAllowedError") {
      console.log("Camera access denied. Asking again...");
      setTimeout(requestCameraAccess, 1000); // Retry after 1 second
    } else {
      console.error("An error occurred:", error);
    }
  }
}

export { requestCameraAccess };