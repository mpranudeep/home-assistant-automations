define(["require", "exports", "../accUtils", "knockout", "ojs/ojarraydataprovider", "ojs/ojformlayout", "oj-c/button", "ojs/ojswitch", "ojs/ojselectsingle", "ojs/ojinputnumber"], function (require, exports, AccUtils, ko, ArrayDataProvider) {
    "use strict";
    class PreferencesViewModel {
        constructor() {
            this.savePreferences = () => {
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
            this.ttsEngine = ko.observable(storedTtsEngine || "piper");
            const storedTtsVoice = localStorage.getItem("ttsVoice");
            this.ttsVoice = ko.observable(storedTtsVoice || "af_heart");
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
            this.ttsEngineOptions = new ArrayDataProvider([
                { value: "piper", label: "Piper" },
                { value: "kokoro", label: "Kokoro TTS" },
                { value: "browser", label: "Browser Speech" }
            ], { keyAttributes: "value" });
            this.saved = ko.observable(false);
        }
        connected() {
            AccUtils.announce("Preferences Page loaded.");
            document.title = "Preferences";
        }
    }
    return PreferencesViewModel;
});
