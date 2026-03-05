/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
import * as AccUtils from "../accUtils";
import * as ko from "knockout";
import ArrayDataProvider = require("ojs/ojarraydataprovider");

import "ojs/ojformlayout";
import "oj-c/button";
import "ojs/ojswitch";
import "ojs/ojselectsingle";
import "ojs/ojinputnumber";

class PreferencesViewModel {
  enableNotifications: ko.Observable<boolean>;
  darkMode: ko.Observable<boolean>;
  autoPlay: ko.Observable<boolean>;
  spellCorrectEnabled: ko.Observable<boolean>;
  playbackRate: ko.Observable<number>;
  ttsEngine: ko.Observable<string>;
  ttsEngineOptions: ArrayDataProvider<string, { value: string; label: string }>;
  ttsVoice: ko.Observable<string>;
  ttsVoiceOptions: ArrayDataProvider<string, { value: string; label: string }>;
  saved: ko.Observable<boolean>;

  constructor() {
    // Initialize from local storage or set defaults
    const storedEnableNotifications = localStorage.getItem("enableNotifications");
    const storedDarkMode = localStorage.getItem("darkMode");
    const storedAutoPlay = localStorage.getItem("autoPlay");
    const storedSpellCorrectEnabled = localStorage.getItem("spellCorrectEnabled");
    const storedPlaybackRate = localStorage.getItem("playbackRate");
    const storedTtsEngine = localStorage.getItem("ttsEngine");

    this.enableNotifications = ko.observable(storedEnableNotifications === null ? false : storedEnableNotifications === "true");
    this.darkMode = ko.observable(storedDarkMode === null ? false : storedDarkMode === "true");

    this.autoPlay = ko.observable(storedAutoPlay === "true");
    this.spellCorrectEnabled = ko.observable(storedSpellCorrectEnabled === "true");
    this.playbackRate = ko.observable(storedPlaybackRate !== null ? parseFloat(storedPlaybackRate) : 1);

    // Default to 'piper' if no TTS engine stored
    this.ttsEngine = ko.observable(storedTtsEngine || "piper");

    // TTS Voice selection
    const storedTtsVoice = localStorage.getItem("ttsVoice");
    this.ttsVoice = ko.observable(storedTtsVoice || "af_heart");

    // Voice options array with friendly labels
    const kokoroVoices = [
      { value: "af_heart", label: "Heart (Female, ❤️, Best Quality)" },
      { value: "af_alloy", label: "Alloy (Female, medium quality)" },
      { value: "af_aoede", label: "Aoede (Female, medium quality, C+)" },
      { value: "af_bella", label: "Bella (Female, 🔥, A-)" },
      { value: "af_jessica", label: "Jessica (Female, basic)" },
      { value: "af_kore", label: "Kore (Female, neutral, C+)" },
      { value: "af_nicole", label: "Nicole (Female, 🎧, B-)" },
      { value: "af_nova", label: "Nova (Female, clear, C)" },
      { value: "af_river", label: "River (Female, basic)" },
      { value: "af_sarah", label: "Sarah (Female, C+)" },
      { value: "af_sky", label: "Sky (Female, modern, C-)" },
      { value: "am_adam", label: "Adam (Male, raw, F+)" },
      { value: "am_echo", label: "Echo (Male, deep, D)" },
      { value: "am_eric", label: "Eric (Male, neutral, D)" },
      { value: "am_fenrir", label: "Fenrir (Male, powerful, C+)" },
      { value: "am_liam", label: "Liam (Male, gentle, D)" },
      { value: "am_michael", label: "Michael (Male, clear, C+)" },
      { value: "am_onyx", label: "Onyx (Male, modern, D)" },
      { value: "am_puck", label: "Puck (Male, crisp, C+)" },
      { value: "am_santa", label: "Santa (Male, jovial, D-)" },
      // British English
      { value: "bf_alice", label: "Alice (British Female, D)" },
      { value: "bf_emma", label: "Emma (British Female, B-)" },
      { value: "bf_isabella", label: "Isabella (British Female, C)" },
      { value: "bf_lily", label: "Lily (British Female, D)" },
      { value: "bm_daniel", label: "Daniel (British Male, D)" },
      { value: "bm_fable", label: "Fable (British Male, C)" },
      { value: "bm_george", label: "George (British Male, C)" },
      { value: "bm_lewis", label: "Lewis (British Male, D+)" },
    ];
    this.ttsVoiceOptions = new ArrayDataProvider(kokoroVoices, { keyAttributes: "value" });

    // ArrayDataProvider for TTS engine select
    this.ttsEngineOptions = new ArrayDataProvider(
      [
        { value: "piper", label: "Piper" },
        { value: "kokoro", label: "Kokoro TTS" },
        { value: "browser", label: "Browser Speech" }
      ],
      { keyAttributes: "value" }
    );

    this.saved = ko.observable(false);
  }

  connected(): void {
    AccUtils.announce("Preferences Page loaded.");
    document.title = "Preferences";
  }

  savePreferences = (): void => {
    localStorage.setItem("enableNotifications", this.enableNotifications().toString());
    localStorage.setItem("darkMode", this.darkMode().toString());
    localStorage.setItem("autoPlay", this.autoPlay().toString());
    localStorage.setItem("spellCorrectEnabled", this.spellCorrectEnabled().toString());
    localStorage.setItem("playbackRate", this.playbackRate().toString());
    localStorage.setItem("ttsEngine", this.ttsEngine());
    localStorage.setItem("ttsVoice", this.ttsVoice());
    this.saved(true);
    setTimeout(() => this.saved(false), 1500);
  };
}

export = PreferencesViewModel;