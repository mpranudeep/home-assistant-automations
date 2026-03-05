import * as ko from "knockout";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import "ojs/ojformlayout";
import "oj-c/button";
import "ojs/ojswitch";
import "ojs/ojselectsingle";
import "ojs/ojinputnumber";
declare class PreferencesViewModel {
    enableNotifications: ko.Observable<boolean>;
    darkMode: ko.Observable<boolean>;
    autoPlay: ko.Observable<boolean>;
    spellCorrectEnabled: ko.Observable<boolean>;
    playbackRate: ko.Observable<number>;
    ttsEngine: ko.Observable<string>;
    ttsEngineOptions: ArrayDataProvider<string, {
        value: string;
        label: string;
    }>;
    ttsVoice: ko.Observable<string>;
    ttsVoiceOptions: ArrayDataProvider<string, {
        value: string;
        label: string;
    }>;
    saved: ko.Observable<boolean>;
    constructor();
    connected(): void;
    savePreferences: () => void;
}
export = PreferencesViewModel;
