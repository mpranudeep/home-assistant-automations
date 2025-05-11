"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
const AccUtils = __importStar(require("../accUtils"));
const AppUtils = __importStar(require("../appUtils"));
const ko = __importStar(require("knockout"));
require("oj-c/input-text");
require("ojs/ojformlayout");
require("oj-c/button");
require("ojs/ojswitch");
require("oj-c/input-number");
class MyReaderViewModel {
    constructor() {
        this.loadCounter = 8;
        this.onLoadURLButtonClicked = (event) => {
            let mainURL = this.inputURL();
            if (mainURL) {
                this.navigateToChapter(mainURL, false, this.playbackRate());
            }
        };
        this.onParagraphClicked = (event) => {
            console.log("On Paragraph clicked");
        };
        this.playButtonClicked = (event) => {
            this.playAction();
        };
        this.pauseButtonClicked = (event) => {
            this.pauseAction();
        };
        this.nextButtonClicked = (event) => {
            let self = this;
            self.loadNextChapter();
        };
        this.prevButtonClicked = (event) => {
            let self = this;
            self.playFromParagraph(self.currentLineNumber() - 1);
        };
        let self = this;
        this.inputURL = ko.observable("https://fast.novelupdates.net/book/shadow-slave/chapter-1735-toast-to-loyalty");
        this.novelParagraphs = ko.observableArray();
        this.playerControls = {
            playEnabled: ko.observable(false)
        };
        this.currentLineNumber = ko.observable(-1);
        this.config = AppUtils.getConfiguration();
        this.nextChapterURL = ko.observable();
        this.playbackRate = ko.observable(1);
        this.spellCorrectEnabled = ko.observable(false);
    }
    /**
     * Optional ViewModel method invoked after the View is inserted into the
     * document DOM.  The application can put logic that requires the DOM being
     * attached here.
     * This method might be called multiple times - after the View is created
     * and inserted into the DOM and after the View is reconnected
     * after being disconnected.
     */
    connected() {
        let self = this;
        AccUtils.announce("My Reader Page TS");
        document.title = "My Reader";
        // implement further logic if needed
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playbackRate.subscribe(function (newValue) {
            // @ts-ignore
            self.audioPlayer.playbackRate = parseFloat(newValue);
        });
        this.audioSource = document.getElementById('audioSource');
        this.audioPlayer.addEventListener('ended', function () {
            self.playFromParagraph(self.currentLineNumber() + 1);
        });
        let url = new URL(window.location.href);
        let params = new URLSearchParams(url.search);
        let urlInputURL = params.get('inputURL');
        let autoPlayEnabled = params.get('autoPlay');
        if (autoPlayEnabled == 'true') {
            self.playerControls.playEnabled(true);
        }
        let spellCorrectEnabled = params.get('spellCorrectEnabled');
        if (spellCorrectEnabled == 'true') {
            self.spellCorrectEnabled(true);
        }
        else {
            self.spellCorrectEnabled(false);
        }
        let playbackRate = params.get('playbackRate');
        if (playbackRate) {
            self.playbackRate(parseFloat(playbackRate));
        }
        if (urlInputURL) {
            self.inputURL(urlInputURL);
            this.loadChapter(self.inputURL());
        }
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
                self.loadNextChapter();
            }
            if (event.key === ' ') {
                if (self.playerControls.playEnabled()) {
                    self.pauseAction();
                }
                else {
                    self.playAction();
                }
                event.preventDefault();
            }
        });
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => {
                // self.playAction();
                console.log('Play event');
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                // self.pauseAction();
                console.log('Pause event');
            });
        }
    }
    /**
     * Optional ViewModel method invoked after the View is disconnected from the DOM.
     */
    disconnected() {
        // implement if needed
    }
    /**
     * Optional ViewModel method invoked after transition to the new View is complete.
     * That includes any possible animation between the old and the new View.
     */
    transitionCompleted() {
        // implement if needed
    }
    async loadNextChapter() {
        let self = this;
        let nextChapterURL = this.nextChapterURL();
        if (nextChapterURL) {
            this.navigateToChapter(nextChapterURL, self.playerControls.playEnabled(), self.playbackRate());
        }
    }
    async navigateToChapter(chapterURL, autoPlay, playbackRate) {
        let self = this;
        if (chapterURL) {
            for (let eachP of self.novelParagraphs()) {
                let eachPO = eachP();
                if (eachPO.audioFile) {
                    let filePath = await eachPO.audioFile;
                    let deleteURL = `${this.config.hostName}/api/text-to-speech/delete-file?filePath=${filePath}`;
                    await fetch(deleteURL);
                }
            }
            let url = new URL(window.location.href);
            url.searchParams.set("inputURL", chapterURL);
            if (autoPlay) {
                url.searchParams.set("autoPlay", "true");
            }
            else {
                url.searchParams.set("autoPlay", "false");
            }
            if (self.spellCorrectEnabled()) {
                url.searchParams.set("spellCorrectEnabled", "true");
            }
            else {
                url.searchParams.set("spellCorrectEnabled", "false");
            }
            if (playbackRate) {
                url.searchParams.set("playbackRate", playbackRate + "");
            }
            window.location.href = url.toString();
        }
    }
    async playFromParagraph(pNumber) {
        let self = this;
        this.audioPlayer?.pause();
        if (pNumber < 0) {
            pNumber = 0;
        }
        this.currentLineNumber(pNumber);
        if (this.novelParagraphs().length == 0) {
            console.log("Chapter not loaded");
            return;
        }
        if (!this.playerControls.playEnabled()) {
            return;
        }
        if (this.currentLineNumber() >= this.novelParagraphs().length) {
            this.loadNextChapter();
            return;
        }
        if (this.loadCounter < 10) {
            this.loadCounter = this.loadCounter + 1;
        }
        for (let i = pNumber; i <= (pNumber + this.loadCounter) && i < this.novelParagraphs().length; i++) {
            let item = this.novelParagraphs()[i]();
            if (!item.audioFile) {
                item.audioFile = self.convertToAudioFile(item.text);
            }
        }
        let currentP = this.novelParagraphs()[pNumber]();
        let audioFileURL = await currentP.audioFile;
        self.audioSource.src = audioFileURL;
        self.audioPlayer.load();
        // @ts-ignore
        self.audioPlayer.playbackRate = parseFloat(self.playbackRate());
        self.audioPlayer?.play();
        let targetP = document.getElementById('paragraph-' + (pNumber + 1));
        self.scrollToTargetAdjusted(targetP);
    }
    async sleep(time) {
        let promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                // @ts-ignore
                resolve();
            }, time);
        });
        await promise;
    }
    async convertToAudioFile(text) {
        while (true) {
            try {
                let convertedResponse = await fetch(`${this.config.hostName}/api/text-to-speech/convert`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "text": text
                    })
                });
                let response = await convertedResponse.json();
                let filePath = response.audioFilePath;
                filePath = encodeURI(filePath);
                let audioFileURL = `${this.config.hostName}/api/text-to-speech/audio-file?filePath=${filePath}`;
                return audioFileURL;
            }
            catch (ex) {
                console.log(ex);
                this.sleep(1000);
            }
        }
    }
    async loadChapter(url) {
        let self = this;
        let config = AppUtils.getConfiguration();
        console.log(`${AppUtils.getConfiguration().hostName}`);
        let result = await fetch(`${config.hostName}/api/novel-content?requestURL=${url}&spellCorrectEnabled=${this.spellCorrectEnabled()}`);
        let i = 1;
        let response = await result.json();
        // @ts-ignore
        for (let eachLine of response.items) {
            let eachP = {
                id: i++,
                text: eachLine.line,
                audioFile: undefined
            };
            let ob = ko.observable(eachP);
            self.novelParagraphs.push(ob);
        }
        this.nextChapterURL(response.nextChapterURL);
        if (this.nextChapterURL()) {
            fetch(`${config.hostName}/api/novel-content?requestURL=${this.nextChapterURL()}&spellCorrectEnabled=${this.spellCorrectEnabled()}`);
        }
        // @ts-ignore
        $(".paragraph").click(function (event) {
            console.log("P Clicked " + event.target.id);
            let paragphNumber = parseInt(event.target.id.replace("paragraph-", ""));
            self.playFromParagraph(paragphNumber - 1);
        });
        if (self.playerControls.playEnabled()) {
            this.playFromParagraph(0);
        }
    }
    scrollToTargetAdjusted(element) {
        var headerOffset = 150;
        var elementPosition = element.getBoundingClientRect().top;
        var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
    pauseAction() {
        let self = this;
        self.audioPlayer.pause();
        self.playerControls.playEnabled(false);
    }
    playAction() {
        let self = this;
        self.playerControls.playEnabled(true);
        self.playFromParagraph(self.currentLineNumber());
    }
}
module.exports = MyReaderViewModel;
