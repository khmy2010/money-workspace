// export GOOGLE_APPLICATION_CREDENTIALS="credentials/gcpkey.json"

// Overview API: https://cloud.google.com/nodejs/docs/reference/vision/latest/overview

// https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse#likelihood
export enum Likelihood {
  UNKNOWN = 'UNKNOWN',
  VERY_UNLIKELY = 'VERY_UNLIKELY',
  UNLIKELY = 'UNLIKELY',
  POSSIBLE = 'POSSIBLE',
  LIKELY = 'LIKELY',
  VERY_LIKELY = 'VERY_LIKELY',
}

// https://cloud.google.com/nodejs/docs/reference/vision/latest/vision/protos.google.cloud.vision.v1.safesearchannotation#properties
export interface SafeSearchAnnotation {
  adult: Likelihood,
  adultConfidence: number;
  medical: Likelihood;
  medicalConfidence: number;
  nsfwConfidence: number;
  racy: Likelihood;
  racyConfidence: number;
  spoof: Likelihood;
  spoofConfidence: number;
  violence: Likelihood;
  violenceConfidence: number;
}

// https://cloud.google.com/vision/docs/reference/rest/v1/Feature#type
export enum FeatureType {
  TYPE_UNSPECIFIED = 'TYPE_UNSPECIFIED',
  FACE_DETECTION = 'FACE_DETECTION',
  LANDMARK_DETECTION = 'LANDMARK_DETECTION',
  LOGO_DETECTION = 'LOGO_DETECTION',
  LABEL_DETECTION = 'LABEL_DETECTION',
  TEXT_DETECTION = 'TEXT_DETECTION',
  DOCUMENT_TEXT_DETECTION = 'DOCUMENT_TEXT_DETECTION',
  SAFE_SEARCH_DETECTION = 'SAFE_SEARCH_DETECTION',
  IMAGE_PROPERTIES = 'IMAGE_PROPERTIES',
  CROP_HINTS = 'CROP_HINTS',
  WEB_DETECTION = 'WEB_DETECTION',
  PRODUCT_SEARCH = 'PRODUCT_SEARCH',
  OBJECT_LOCALIZATION = 'OBJECT_LOCALIZATION',
}