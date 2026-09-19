"use client";

import { useLocalState } from "./local";
import { COMBO_KEY, DEFAULT_PROFILE, PROFILE_KEY, parseCombo, parseProfile, type ComboItem } from "./profile";

const EMPTY_COMBO: ComboItem[] = [];

export const useProfile = () => useLocalState(PROFILE_KEY, DEFAULT_PROFILE, parseProfile);
export const useCombo = () => useLocalState(COMBO_KEY, EMPTY_COMBO, parseCombo);
