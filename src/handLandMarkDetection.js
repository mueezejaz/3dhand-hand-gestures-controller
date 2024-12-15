import { FilesetResolver,HandLandmarker } from "@mediapipe/tasks-vision";
import { distanceFinder, findMidpoint } from "./utils";
import { box } from ".";
let handLandmarkerModel = undefined;
let otherData = {}
let pincingobj = {}
const loadModel = async()=>{
 try {
  //make funtion to set loading state on screen eg loading midel
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  handLandmarkerModel = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.7,
    minHandPresenceConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });
      // show state that model is loaded
      console.log("model is loaded",handLandmarkerModel)

  
 } catch (error) {
    console.log(error)
 }
}
function isPinching(p1,p2) {
 let treshHold = 0.05
 let distance = distanceFinder(p1,p2)
 if(distance <= treshHold ){
  return true
 }
 else{
  return false
 }
}
function changeSizeOf3dModel(p1,p2){
  const currentDistance = distanceFinder(p1, p2);
    if (otherData.preDisBWBF) {
        if (currentDistance > otherData.preDisBWBF&&Math.abs(currentDistance-otherData.preDisBWBF)>0.01) {
            console.log("Distance increased, incrementing model size.");
            box.scale.x += 0.05; 
            box.scale.y += 0.05; 
            box.scale.z += 0.05; 
        } else if (currentDistance < otherData.preDisBWBF&&Math.abs(currentDistance-otherData.preDisBWBF)>0.01) {
            console.log("Distance decreased, decrementing model size.");
            // Call your 3D model size decrement function
            box.scale.x = Math.max(0.1, box.scale.x - 0.05); // Ensure size doesn't go below minimum
            box.scale.y = Math.max(0.1, box.scale.y - 0.05);
            box.scale.z = Math.max(0.1, box.scale.z - 0.05);
        }
    }

    // Update previous distance
    otherData.preDisBWBF = currentDistance;
}
function changeRotationof3dobj(p1, p2) {
  // Calculate the differences
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;

  // Calculate rotation angles
  const rotationX = Math.atan2(dy, dz); // Rotation around X-axis
  const rotationY = Math.atan2(dx, dz); // Rotation around Y-axis
  const rotationZ = Math.atan2(dy, dx); // Rotation around Z-axis

  // Apply the rotations to the 3D object (box)
  box.rotation.x = rotationX; // Rotate around X-axis
  box.rotation.y = rotationY; // Rotate around Y-axis
  box.rotation.z = rotationZ; // Rotate around Z-axis

  console.log(
      `Updated Rotations -> X: ${rotationX} rad, Y: ${rotationY} rad, Z: ${rotationZ} rad`
  );
}
function place3dmodelinbetween(p1,p2){
   let midpint = findMidpoint(p1,p2)
   console.log("z value of box is ",midpint.z)
   box.position.set(-midpint.x,midpint.y,midpint.z)
}
function mainControllerfunction(bothHandsLandmarks){
  let hands = {
  }
  bothHandsLandmarks.landmarks.forEach((hand,index)=>{
    let handName = bothHandsLandmarks.handednesses[index][0].categoryName
    hands[handName] = hand
  })
  //if there is pinching in both hand index and thumb change the size of 3d model on the base of distance 
  if (
    hands?.Left &&
    hands?.Right &&
    isPinching(hands.Left[4], hands.Left[8]) &&
    isPinching(hands.Right[4], hands.Right[8])
  ) {
  //adding pre distance value 
    changeSizeOf3dModel(hands.Left[4], hands.Right[4])
    place3dmodelinbetween(deNormalizePoint(hands.Left[4]),deNormalizePoint(hands.Right[4]))
    changeRotationof3dobj(deNormalizePoint(hands.Left[4]),deNormalizePoint(hands.Right[4]))
  }
  
}
function deNormalization(landmarksobj) {
  mainControllerfunction(landmarksobj)
  landmarksobj.landmarks.forEach((hand,index) => {
      hand.forEach((landmark,index) => {
        const deNormalizedPoint = deNormalizePoint(landmark);
        landmark.x = deNormalizedPoint.x;
        landmark.y = deNormalizedPoint.y;
        landmark.z = deNormalizedPoint.z; // Map z directly
      });
  });
 
  return landmarksobj.landmarks;
}
function deNormalizePoint(point) {
  // Define your scene boundaries
  const sceneXRange = [0, 20]; // Range for x
  const sceneYRange = [0, 15]; // Range for y
  const sceneZRange = [0, 3];  // Range for z (depth)

  // Function to map normalized values to the scene range
  function mapToRange(value, range) {
    return range[0] + (value - 0.5) * (range[1] - range[0]);
  }

  // De-normalize the point
  return  {
    x: mapToRange(point.x, sceneXRange),
    y: mapToRange(1 - point.y, sceneYRange), // Flip y-axis
    z: mapToRange(point.z, sceneZRange)
  };


}


async function detectFunction(video) {
    let startTimeMs = performance.now();
   let data =  await handLandmarkerModel.detectForVideo(video, startTimeMs);
  //  console.log("data is ", data)
   return deNormalization(data)
  }
export {loadModel,detectFunction,pincingobj}
  
  