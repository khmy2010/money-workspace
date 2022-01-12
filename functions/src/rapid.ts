import { ObjectMetadata } from "firebase-functions/v1/storage";
import { auditVisionAPIUsage } from "./audit";
import { firestore } from 'firebase-admin';
import { FeatureType } from "./models/vision.model";

const vision = require('@google-cloud/vision');

// https://cloud.google.com/vision/docs/ocr#vision_text_detection-nodejs
// https://googleapis.dev/nodejs/vision/latest/index.html
export const performOcr = async (object: ObjectMetadata, tempLocalPathFile: string, uid: string, firestore: firestore.Firestore) => {
  let result: any;
  const visionClient = new vision.ImageAnnotatorClient();

  if (process.env.FUNCTIONS_EMULATOR) {
    [result] = await visionClient.documentTextDetection(tempLocalPathFile);
  }
  else {
    [result] = await visionClient.documentTextDetection(
      `gs://${object.bucket}/${object.name}`
    );
  }

  if (result) {
    auditVisionAPIUsage(firestore, object.name as string, uid, FeatureType.DOCUMENT_TEXT_DETECTION);
  }

  // console.log('Result: ', result);

  const detections = result.textAnnotations;
  detections.forEach((text: any) => {
    console.log(text);
  });
}