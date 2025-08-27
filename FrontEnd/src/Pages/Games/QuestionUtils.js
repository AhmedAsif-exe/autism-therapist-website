// Utility helpers for building unambiguous question item pools
// Ensures wrong items do NOT belong to the same selected function/feature/class as the correct items

import { getAllClasses, getAssetsForClass } from './AssetClassMapping';
import { getAllFunctions, getAssetsForFunction } from './AssetFunctionMapping';
import { getAllFeatures, getAssetsForFeature } from './AssetFeatureMapping';

function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function itemsFor(type, key) {
  if (type === 'class') return (getAssetsForClass(key) || []).map(a => a.imagePath);
  if (type === 'function') return (getAssetsForFunction(key) || []).map(a => a.imagePath);
  if (type === 'feature') return (getAssetsForFeature(key) || []).map(a => a.imagePath);
  return [];
}
export function getAllKeysForType(type) {
  try {
    if (type === 'class') return getAllClasses();
    if (type === 'function') return getAllFunctions();
    if (type === 'feature') return getAllFeatures();
  } catch {}
  return [];
}

// Pick a key and build a set of correct and wrong images such that
// - correctImgs are from the chosen key
// - wrongImgs are NOT present in the chosen key's items (prevents overlaps)
// Returns null if constraints cannot be satisfied.
export function pickItemsFromType({ type, numCorrect, numWrong }) {
  const keys = shuffle(getAllKeysForType(type));
  for (const key of keys) {
    const correctPool = itemsFor(type, key);
    const correctSet = new Set(correctPool);
    if (correctPool.length < numCorrect) continue;

    // Build wrong pool from other keys but exclude anything that also belongs to the chosen key
    const wrongPoolSet = new Set();
    for (const otherKey of keys) {
      if (otherKey === key) continue;
      const pool = itemsFor(type, otherKey);
      for (const img of pool) {
        if (!correctSet.has(img)) wrongPoolSet.add(img);
      }
    }
    const wrongPool = Array.from(wrongPoolSet);
    if (wrongPool.length < numWrong) continue;

    const correctImgs = shuffle(correctPool).slice(0, numCorrect);
    const wrongImgs = shuffle(wrongPool).slice(0, numWrong);
    return { type, key, correctImgs, wrongImgs };
  }
  return null;
}

// Build an MCQ for a given type where the chosen image belongs to the correct key
// and none of the distractor keys contain that image (prevents overlap/ambiguity)
export function pickMCQUniqueForType(type, numOptions = 3) {
  const keys = shuffle(getAllKeysForType(type));
  for (const key of keys) {
    const pool = itemsFor(type, key);
    if (!pool?.length) continue;
    for (const img of shuffle(pool)) {
      // Keys that DO NOT contain this image (eligible distractors)
      const distractorKeys = keys.filter(k => k !== key && !(itemsFor(type, k) || []).includes(img));
      if (distractorKeys.length >= numOptions - 1) {
        const distractors = shuffle(distractorKeys).slice(0, numOptions - 1);
        return { type, key, img, options: shuffle([key, ...distractors]) };
      }
    }
  }
  return null;
}

// Utility to gather all icon keys for preloading
export function getAllIconKeys() {
  const map = new Map();
  const push = (list) => list?.forEach(a => { if (a?.imagePath) map.set(a.imagePath, true); });
  try { getAllClasses().forEach(c => push(getAssetsForClass(c))); } catch {}
  try { getAllFunctions().forEach(fn => push(getAssetsForFunction(fn))); } catch {}
  try { getAllFeatures().forEach(f => push(getAssetsForFeature(f))); } catch {}
  return Array.from(map.keys());
}
