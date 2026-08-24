/**
 * Multimodal Stress & Anxiety Scoring Engine for MindShield AI (Frontend)
 *
 * Exact Mathematical Formulas:
 * 1. Voice Score = 0.30 * Speaking-rate + 0.25 * Pause + 0.25 * Pitch + 0.20 * Loudness
 * 2. Behavior Score = 0.25 * Blink + 0.25 * Facial-tension + 0.25 * Movement + 0.25 * Posture
 * 3. Physiological Score = 0.40 * HR deviation + 0.40 * HRV deviation + 0.20 * Breathing deviation
 * 4. Self-report Score = answer * 25 (0-4 scale: 0->0, 1->25, 2->50, 3->75, 4->100)
 * 5. FINAL SCORE = 0.30 * Voice + 0.20 * Behavior + 0.30 * Physiological + 0.20 * Self-report
 *
 * Missing Data:
 * Re-normalizes active weights dynamically so they sum to 100%. Never fabricates sensor data.
 * Non-diagnostic AI wellness estimation disclaimer.
 */

export interface BaselineProfile {
  restingHr?: number;
  restingHrv?: number;
  breathingRate?: number;
  speakingRateWpm?: number;
  pitchHz?: number;
  pauseRatio?: number;
  loudnessDb?: number;
  blinkRateCpm?: number;
  movementEnergy?: number;
  postureDrift?: number;
}

export const DEFAULT_BASELINES: BaselineProfile = {
  restingHr: 72,
  restingHrv: 55,
  breathingRate: 14,
  speakingRateWpm: 130,
  pitchHz: 150,
  pauseRatio: 0.15,
  loudnessDb: 50,
  blinkRateCpm: 18,
  movementEnergy: 15,
  postureDrift: 10,
};

export const BASE_WEIGHTS = {
  voice: 0.30,
  behavior: 0.20,
  physiological: 0.30,
  selfReport: 0.20,
};

export const VOICE_SUB_WEIGHTS = {
  speakingRate: 0.30,
  pause: 0.25,
  pitch: 0.25,
  loudness: 0.20,
};

export const BEHAVIOR_SUB_WEIGHTS = {
  blink: 0.25,
  facialTension: 0.25,
  movement: 0.25,
  posture: 0.25,
};

export const PHYSIOLOGICAL_SUB_WEIGHTS = {
  hrDeviation: 0.40,
  hrvDeviation: 0.40,
  breathingDeviation: 0.20,
};

export interface ModalityContribution {
  modality: 'voice' | 'behavior' | 'physiological' | 'self_report';
  label: string;
  score: number | null;
  baseWeight: number;
  effectiveWeight: number;
  contributionPoints: number;
  available: boolean;
  subComponents?: Record<string, number | null>;
}

export interface MultimodalResult {
  status: 'success' | 'insufficient_data';
  voiceScore: number | null;
  behaviorScore: number | null;
  physiologicalScore: number | null;
  selfReportScore: number | null;
  finalStressScore: number | null;
  interpretation: 'Low' | 'Mild' | 'Moderate' | 'High' | 'Insufficient data';
  category: 'calm' | 'mild' | 'moderate' | 'high' | 'insufficient_data';
  confidence: number;
  modalitiesAvailable: string[];
  modalitiesUnavailable: string[];
  contributions: ModalityContribution[];
  isMedicalDiagnosis: false;
  disclaimer: string;
  recommendedAction: string;
}

export function clamp(val: number, minVal = 0, maxVal = 100): number {
  return Math.max(minVal, Math.min(maxVal, val));
}

export function normalizeDeviation(
  current: number | undefined | null,
  baseline: number,
  maxExpectedDelta: number
): number | null {
  if (current === undefined || current === null) return null;
  const delta = Math.abs(current - baseline);
  const normalized = (delta / maxExpectedDelta) * 100;
  return clamp(normalized, 0, 100);
}

// 1. VOICE SCORE
export function calculateVoiceScore(params: {
  speakingRateScore?: number | null;
  pauseScore?: number | null;
  pitchScore?: number | null;
  loudnessScore?: number | null;
  rawMetrics?: {
    speakingRateWpm?: number;
    pauseRatio?: number;
    pitchHz?: number;
    loudnessDb?: number;
    voiceActivity?: number;
    rms?: number;
  };
  baseline?: BaselineProfile;
}): { score: number | null; subComponents: Record<string, number | null>; available: boolean } {
  const base = params.baseline || DEFAULT_BASELINES;
  let sr = params.speakingRateScore;
  let pause = params.pauseScore;
  let pitch = params.pitchScore;
  let loud = params.loudnessScore;

  if (params.rawMetrics) {
    if (sr === undefined || sr === null) {
      if (params.rawMetrics.speakingRateWpm !== undefined) {
        sr = normalizeDeviation(params.rawMetrics.speakingRateWpm, base.speakingRateWpm ?? 130, 60);
      } else if (params.rawMetrics.voiceActivity !== undefined) {
        sr = clamp(params.rawMetrics.voiceActivity);
      }
    }
    if (pause === undefined || pause === null) {
      if (params.rawMetrics.pauseRatio !== undefined) {
        pause = normalizeDeviation(params.rawMetrics.pauseRatio, base.pauseRatio ?? 0.15, 0.35);
      }
    }
    if (pitch === undefined || pitch === null) {
      if (params.rawMetrics.pitchHz !== undefined) {
        pitch = normalizeDeviation(params.rawMetrics.pitchHz, base.pitchHz ?? 150, 80);
      }
    }
    if (loud === undefined || loud === null) {
      if (params.rawMetrics.loudnessDb !== undefined) {
        loud = normalizeDeviation(params.rawMetrics.loudnessDb, base.loudnessDb ?? 50, 30);
      } else if (params.rawMetrics.rms !== undefined) {
        loud = clamp(params.rawMetrics.rms * 100);
      }
    }
  }

  const subComponents: Record<string, number | null> = {
    speakingRate: sr !== undefined && sr !== null ? clamp(sr) : null,
    pause: pause !== undefined && pause !== null ? clamp(pause) : null,
    pitch: pitch !== undefined && pitch !== null ? clamp(pitch) : null,
    loudness: loud !== undefined && loud !== null ? clamp(loud) : null,
  };

  const activeKeys = Object.keys(subComponents).filter(k => subComponents[k] !== null);
  if (activeKeys.length === 0) {
    return { score: null, subComponents, available: false };
  }

  const activeWeightSum = activeKeys.reduce(
    (acc, k) => acc + (VOICE_SUB_WEIGHTS as any)[k],
    0
  );
  const weightedSum = activeKeys.reduce(
    (acc, k) => acc + (subComponents[k]! * ((VOICE_SUB_WEIGHTS as any)[k] / activeWeightSum)),
    0
  );

  return {
    score: Math.round(clamp(weightedSum) * 10) / 10,
    subComponents,
    available: true,
  };
}

// 2. BEHAVIOR SCORE
export function calculateBehaviorScore(params: {
  blinkDeviation?: number | null;
  facialTension?: number | null;
  movementRestlessness?: number | null;
  postureDeviation?: number | null;
  rawMetrics?: {
    blinkRateCpm?: number;
    motionEnergy?: number;
    postureDrift?: number;
    facialTensionIndex?: number;
    visualActivity?: number;
  };
  baseline?: BaselineProfile;
}): { score: number | null; subComponents: Record<string, number | null>; available: boolean } {
  const base = params.baseline || DEFAULT_BASELINES;
  let blink = params.blinkDeviation;
  let tension = params.facialTension;
  let movement = params.movementRestlessness;
  let posture = params.postureDeviation;

  if (params.rawMetrics) {
    if (blink === undefined || blink === null) {
      if (params.rawMetrics.blinkRateCpm !== undefined) {
        blink = normalizeDeviation(params.rawMetrics.blinkRateCpm, base.blinkRateCpm ?? 18, 20);
      }
    }
    if (movement === undefined || movement === null) {
      if (params.rawMetrics.motionEnergy !== undefined) {
        movement = normalizeDeviation(params.rawMetrics.motionEnergy, base.movementEnergy ?? 15, 60);
      } else if (params.rawMetrics.visualActivity !== undefined) {
        movement = clamp(params.rawMetrics.visualActivity);
      }
    }
    if (posture === undefined || posture === null) {
      if (params.rawMetrics.postureDrift !== undefined) {
        posture = normalizeDeviation(params.rawMetrics.postureDrift, base.postureDrift ?? 10, 50);
      }
    }
    if (tension === undefined || tension === null) {
      if (params.rawMetrics.facialTensionIndex !== undefined) {
        tension = clamp(params.rawMetrics.facialTensionIndex);
      }
    }
  }

  const subComponents: Record<string, number | null> = {
    blink: blink !== undefined && blink !== null ? clamp(blink) : null,
    facialTension: tension !== undefined && tension !== null ? clamp(tension) : null,
    movement: movement !== undefined && movement !== null ? clamp(movement) : null,
    posture: posture !== undefined && posture !== null ? clamp(posture) : null,
  };

  const activeKeys = Object.keys(subComponents).filter(k => subComponents[k] !== null);
  if (activeKeys.length === 0) {
    return { score: null, subComponents, available: false };
  }

  const activeWeightSum = activeKeys.reduce(
    (acc, k) => acc + (BEHAVIOR_SUB_WEIGHTS as any)[k],
    0
  );
  const weightedSum = activeKeys.reduce(
    (acc, k) => acc + (subComponents[k]! * ((BEHAVIOR_SUB_WEIGHTS as any)[k] / activeWeightSum)),
    0
  );

  return {
    score: Math.round(clamp(weightedSum) * 10) / 10,
    subComponents,
    available: true,
  };
}

// 3. PHYSIOLOGICAL SCORE
export function calculatePhysiologicalScore(params: {
  hrDeviation?: number | null;
  hrvDeviation?: number | null;
  breathingDeviation?: number | null;
  rawMetrics?: {
    heartRateBpm?: number;
    hrvMs?: number;
    respirationRate?: number;
  };
  baseline?: BaselineProfile;
}): { score: number | null; subComponents: Record<string, number | null>; available: boolean } {
  const base = params.baseline || DEFAULT_BASELINES;
  let hr = params.hrDeviation;
  let hrv = params.hrvDeviation;
  let resp = params.breathingDeviation;

  if (params.rawMetrics) {
    if (hr === undefined || hr === null) {
      if (params.rawMetrics.heartRateBpm !== undefined) {
        const delta = Math.max(0, params.rawMetrics.heartRateBpm - (base.restingHr ?? 72));
        hr = clamp((delta / 35) * 100);
      }
    }
    if (hrv === undefined || hrv === null) {
      if (params.rawMetrics.hrvMs !== undefined) {
        const drop = Math.max(0, (base.restingHrv ?? 55) - params.rawMetrics.hrvMs);
        hrv = clamp((drop / 30) * 100);
      }
    }
    if (resp === undefined || resp === null) {
      if (params.rawMetrics.respirationRate !== undefined) {
        resp = normalizeDeviation(params.rawMetrics.respirationRate, base.breathingRate ?? 14, 12);
      }
    }
  }

  const subComponents: Record<string, number | null> = {
    hrDeviation: hr !== undefined && hr !== null ? clamp(hr) : null,
    hrvDeviation: hrv !== undefined && hrv !== null ? clamp(hrv) : null,
    breathingDeviation: resp !== undefined && resp !== null ? clamp(resp) : null,
  };

  const activeKeys = Object.keys(subComponents).filter(k => subComponents[k] !== null);
  if (activeKeys.length === 0) {
    return { score: null, subComponents, available: false };
  }

  const activeWeightSum = activeKeys.reduce(
    (acc, k) => acc + (PHYSIOLOGICAL_SUB_WEIGHTS as any)[k],
    0
  );
  const weightedSum = activeKeys.reduce(
    (acc, k) => acc + (subComponents[k]! * ((PHYSIOLOGICAL_SUB_WEIGHTS as any)[k] / activeWeightSum)),
    0
  );

  return {
    score: Math.round(clamp(weightedSum) * 10) / 10,
    subComponents,
    available: true,
  };
}

// 4. SELF-REPORT SCORE
export function calculateSelfReportScore(
  answer: number | undefined | null,
  scaleType: '0-4' | '1-10' | '1-5' | '0-100' = '0-4'
): { score: number | null; available: boolean } {
  if (answer === undefined || answer === null) {
    return { score: null, available: false };
  }

  let score = 0;
  if (scaleType === '0-4') {
    // Exact requested rule: answer * 25
    score = clamp(answer * 25);
  } else if (scaleType === '1-10') {
    score = clamp(((answer - 1) / 9) * 100);
  } else if (scaleType === '1-5') {
    score = clamp(((answer - 1) / 4) * 100);
  } else {
    score = clamp(answer);
  }

  return { score: Math.round(score * 10) / 10, available: true };
}

// 5. FINAL MULTIMODAL SCORE FUSION
export function computeMultimodalStress(options: {
  voiceScore?: number | null;
  behaviorScore?: number | null;
  physiologicalScore?: number | null;
  selfReportScore?: number | null;
  voiceInputs?: any;
  behaviorInputs?: any;
  physiologicalInputs?: any;
  selfReportVal?: number | null;
  selfReportScale?: '0-4' | '1-10' | '1-5' | '0-100';
  baseline?: BaselineProfile;
}): MultimodalResult {
  const base = options.baseline || DEFAULT_BASELINES;

  let vRes = { score: options.voiceScore ?? null, subComponents: {}, available: options.voiceScore !== null && options.voiceScore !== undefined };
  if (options.voiceInputs || options.voiceScore === undefined) {
    vRes = calculateVoiceScore({
      speakingRateScore: options.voiceInputs?.speakingRate,
      pauseScore: options.voiceInputs?.pause,
      pitchScore: options.voiceInputs?.pitch,
      loudnessScore: options.voiceInputs?.loudness,
      rawMetrics: options.voiceInputs,
      baseline: base,
    });
  }

  let bRes = { score: options.behaviorScore ?? null, subComponents: {}, available: options.behaviorScore !== null && options.behaviorScore !== undefined };
  if (options.behaviorInputs || options.behaviorScore === undefined) {
    bRes = calculateBehaviorScore({
      blinkDeviation: options.behaviorInputs?.blink,
      facialTension: options.behaviorInputs?.facialTension,
      movementRestlessness: options.behaviorInputs?.movement,
      postureDeviation: options.behaviorInputs?.posture,
      rawMetrics: options.behaviorInputs,
      baseline: base,
    });
  }

  let pRes = { score: options.physiologicalScore ?? null, subComponents: {}, available: options.physiologicalScore !== null && options.physiologicalScore !== undefined };
  if (options.physiologicalInputs || options.physiologicalScore === undefined) {
    pRes = calculatePhysiologicalScore({
      hrDeviation: options.physiologicalInputs?.hrDeviation,
      hrvDeviation: options.physiologicalInputs?.hrvDeviation,
      breathingDeviation: options.physiologicalInputs?.breathingDeviation,
      rawMetrics: options.physiologicalInputs,
      baseline: base,
    });
  }

  let srRes = { score: options.selfReportScore ?? null, available: options.selfReportScore !== null && options.selfReportScore !== undefined };
  if (options.selfReportVal !== undefined || options.selfReportScore === undefined) {
    srRes = calculateSelfReportScore(options.selfReportVal, options.selfReportScale ?? '0-4');
  }

  const modalities: Array<{
    key: 'voice' | 'behavior' | 'physiological' | 'self_report';
    label: string;
    score: number | null;
    baseWeight: number;
    subComponents?: Record<string, number | null>;
  }> = [
    { key: 'voice', label: 'Voice Acoustic Cues', score: vRes.score, baseWeight: BASE_WEIGHTS.voice, subComponents: vRes.subComponents },
    { key: 'behavior', label: 'Behavioral Indicators', score: bRes.score, baseWeight: BASE_WEIGHTS.behavior, subComponents: bRes.subComponents },
    { key: 'physiological', label: 'Physiological Telemetry', score: pRes.score, baseWeight: BASE_WEIGHTS.physiological, subComponents: pRes.subComponents },
    { key: 'self_report', label: 'Self-Reported Assessment', score: srRes.score, baseWeight: BASE_WEIGHTS.selfReport },
  ];

  const activeModalities = modalities.filter(m => m.score !== null);
  const totalActiveWeight = activeModalities.reduce((sum, m) => sum + m.baseWeight, 0);

  if (totalActiveWeight === 0 || activeModalities.length === 0) {
    return {
      status: 'insufficient_data',
      voiceScore: null,
      behaviorScore: null,
      physiologicalScore: null,
      selfReportScore: null,
      finalStressScore: null,
      interpretation: 'Insufficient data',
      category: 'insufficient_data',
      confidence: 0,
      modalitiesAvailable: [],
      modalitiesUnavailable: ['voice', 'behavior', 'physiological', 'self_report'],
      contributions: modalities.map(m => ({
        modality: m.key,
        label: m.label,
        score: null,
        baseWeight: m.baseWeight * 100,
        effectiveWeight: 0,
        contributionPoints: 0,
        available: false,
      })),
      isMedicalDiagnosis: false,
      disclaimer: 'This is an AI-based wellness estimation, NOT a medical diagnosis.',
      recommendedAction: 'Enable at least one sensor (microphone or camera) or complete a brief check-in.',
    };
  }

  let weightedSum = 0;
  const contributions: ModalityContribution[] = [];
  const availableKeys: string[] = [];
  const unavailableKeys: string[] = [];

  modalities.forEach(m => {
    if (m.score !== null) {
      const effectiveWeight = m.baseWeight / totalActiveWeight;
      const pts = m.score * effectiveWeight;
      weightedSum += pts;
      availableKeys.push(m.key);

      contributions.push({
        modality: m.key,
        label: m.label,
        score: Math.round(m.score * 10) / 10,
        baseWeight: Math.round(m.baseWeight * 1000) / 10,
        effectiveWeight: Math.round(effectiveWeight * 1000) / 10,
        contributionPoints: Math.round(pts * 10) / 10,
        available: true,
        subComponents: m.subComponents,
      });
    } else {
      unavailableKeys.push(m.key);
      contributions.push({
        modality: m.key,
        label: m.label,
        score: null,
        baseWeight: Math.round(m.baseWeight * 1000) / 10,
        effectiveWeight: 0,
        contributionPoints: 0,
        available: false,
        subComponents: m.subComponents,
      });
    }
  });

  const finalScore = Math.round(clamp(weightedSum) * 10) / 10;

  // Interpretation Categories (Section 8)
  // 0–24 = Low, 25–49 = Mild, 50–74 = Moderate, 75–100 = High
  let interpretation: 'Low' | 'Mild' | 'Moderate' | 'High' = 'Mild';
  let category: 'calm' | 'mild' | 'moderate' | 'high' = 'mild';

  if (finalScore <= 24) {
    interpretation = 'Low';
    category = 'calm';
  } else if (finalScore <= 49) {
    interpretation = 'Mild';
    category = 'mild';
  } else if (finalScore <= 74) {
    interpretation = 'Moderate';
    category = 'moderate';
  } else {
    interpretation = 'High';
    category = 'high';
  }

  let recommendedAction = '';
  if (interpretation === 'Low') {
    recommendedAction = 'Estimated stress level is low. Your current indicators suggest balance. Maintain your current routines and consider a light mindful pause.';
  } else if (interpretation === 'Mild') {
    recommendedAction = 'Mild stress indicators noted. Try a 2-minute mindful reset, stay hydrated, and practice comfortable 4-6 pacing.';
  } else if (interpretation === 'Moderate') {
    recommendedAction = 'Estimated stress level is moderate. Behavioral and voice signals suggest heightened tension. Consider stepping away from immediate stressors and engaging in a guided grounding exercise.';
  } else {
    recommendedAction = 'High distress indicators observed. Immediate pause recommended: practice guided box breathing, take a restful walk, talk to a trusted friend, or consult a healthcare professional if distress persists.';
  }

  return {
    status: 'success',
    voiceScore: vRes.score,
    behaviorScore: bRes.score,
    physiologicalScore: pRes.score,
    selfReportScore: srRes.score,
    finalStressScore: finalScore,
    interpretation,
    category,
    confidence: Math.round(Math.min(0.98, 0.40 + (activeModalities.length / 4.0) * 0.55) * 100) / 100,
    modalitiesAvailable: availableKeys,
    modalitiesUnavailable: unavailableKeys,
    contributions,
    isMedicalDiagnosis: false,
    disclaimer: 'This is an AI-based wellness estimation, NOT a medical diagnosis.',
    recommendedAction,
  };
}
