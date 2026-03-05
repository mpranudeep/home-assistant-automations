var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../accUtils", "../appUtils", "knockout", "oj-c/input-text", "ojs/ojformlayout", "oj-c/button", "ojs/ojswitch", "oj-c/input-number"], function (require, exports, AccUtils, AppUtils, ko) {
    "use strict";
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
        connected() {
            AccUtils.announce("My Reader Page TS");
            document.title = "My Reader";
            this.audioPlayer = document.getElementById('audioPlayer');
            this.audioSource = document.getElementById('audioSource');
            this.playbackRate.subscribe((newValue) => {
                this.audioPlayer.playbackRate = parseFloat(newValue);
            });
            if (this.audioPlayer) {
                this.audioPlayer.addEventListener('ended', () => {
                    this.playFromParagraph(this.currentLineNumber() + 1);
                });
            }
            const url = new URL(window.location.href);
            const params = new URLSearchParams(url.search);
            const urlInputURL = params.get('inputURL');
            if (urlInputURL) {
                this.inputURL(urlInputURL);
                this.loadChapter(this.inputURL());
            }
            const storedAutoPlay = localStorage.getItem('autoPlay');
            const storedSpellCorrectEnabled = localStorage.getItem('spellCorrectEnabled');
            const storedPlaybackRate = localStorage.getItem('playbackRate');
            this.playerControls.playEnabled(storedAutoPlay === 'true');
            this.spellCorrectEnabled(storedSpellCorrectEnabled === 'true');
            this.playbackRate(storedPlaybackRate !== null ? parseFloat(storedPlaybackRate) : 1);
            if (!this._keydownHandler) {
                this._keydownHandler = (event) => {
                    if (event.key === 'ArrowRight') {
                        this.loadNextChapter();
                    }
                    if (event.key === 'a' || event.key === 'A') {
                        this.playFromParagraph(this.currentLineNumber() + 1);
                    }
                    if (event.key === ' ') {
                        if (this.playerControls.playEnabled()) {
                            this.pauseAction();
                        }
                        else {
                            this.playAction();
                        }
                        event.preventDefault();
                    }
                };
                document.addEventListener('keydown', this._keydownHandler);
            }
            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', () => {
                    console.log('Play event');
                });
                navigator.mediaSession.setActionHandler('pause', () => {
                    console.log('Pause event');
                });
            }
            document.body.classList.add('sepia-mode');
        }
        transitionCompleted() {
        }
        loadNextChapter() {
            return __awaiter(this, void 0, void 0, function* () {
                let self = this;
                let nextChapterURL = this.nextChapterURL();
                if (nextChapterURL) {
                    this.navigateToChapter(nextChapterURL, self.playerControls.playEnabled(), self.playbackRate());
                }
            });
        }
        navigateToChapter(chapterURL, autoPlay, playbackRate) {
            return __awaiter(this, void 0, void 0, function* () {
                let self = this;
                if (chapterURL) {
                    const ttsEngine = localStorage.getItem("ttsEngine") || "piper";
                    if (ttsEngine === "piper") {
                        for (let eachP of self.novelParagraphs()) {
                            let eachPO = eachP();
                            if (eachPO.audioFile) {
                                let filePath = yield eachPO.audioFile;
                                let deleteURL = `${this.config.hostName}/api/text-to-speech/delete-file?filePath=${filePath}`;
                                yield fetch(deleteURL);
                            }
                        }
                    }
                    let url = new URL(window.location.href);
                    url.searchParams.set("inputURL", chapterURL);
                    window.location.href = url.toString();
                }
            });
        }
        playFromParagraph(pNumber) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                let self = this;
                (_a = this.audioPlayer) === null || _a === void 0 ? void 0 : _a.pause();
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
                        const ttsEngine = localStorage.getItem("ttsEngine") || "piper";
                        if (ttsEngine === "piper") {
                            item.audioFile = self.convertToAudioFilePiper(item.text);
                        }
                        else if (ttsEngine === "kokoro") {
                            item.audioFile = self.convertToAudioFileKokoro(item.text);
                        }
                        else if (ttsEngine === "browser") {
                            item.audioFile = Promise.resolve("BROWSER_TTS");
                        }
                    }
                }
                const ttsEngineCurrent = localStorage.getItem("ttsEngine") || "piper";
                let currentP = this.novelParagraphs()[pNumber]();
                if (ttsEngineCurrent === "browser") {
                    yield self.speakWithBrowserTTS(currentP.text, parseFloat(self.playbackRate()));
                    this.currentLineNumber(pNumber + 1);
                    if (this.currentLineNumber() < this.novelParagraphs().length) {
                        if (this.playerControls.playEnabled()) {
                            yield this.playFromParagraph(this.currentLineNumber());
                        }
                    }
                    else {
                        this.loadNextChapter();
                    }
                    return;
                }
                let audioFileURL = yield currentP.audioFile;
                self.audioSource.src = audioFileURL;
                let retryCounter = 3;
                while (retryCounter > 0) {
                    try {
                        yield self.audioPlayer.load();
                        retryCounter = 0;
                    }
                    catch (error) {
                        console.log(error);
                        console.log("Retry loading after 1 second");
                        retryCounter--;
                        yield this.sleep(1000);
                    }
                }
                self.audioPlayer.playbackRate = parseFloat(self.playbackRate());
                yield ((_b = self.audioPlayer) === null || _b === void 0 ? void 0 : _b.play());
                let targetP = document.getElementById('paragraph-' + (pNumber + 1));
                self.scrollToTargetAdjusted(targetP);
            });
        }
        sleep(time) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve) => setTimeout(resolve, time));
            });
        }
        convertToAudioFilePiper(text) {
            return __awaiter(this, void 0, void 0, function* () {
                let retries = 3;
                while (retries > 0) {
                    try {
                        let convertedResponse = yield fetch(`${this.config.hostName}/api/text-to-speech/convert`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text })
                        });
                        let response = yield convertedResponse.json();
                        let filePath = encodeURI(response.audioFilePath);
                        let audioFileURL = `${this.config.hostName}/api/text-to-speech/get-file?filePath=${filePath}`;
                        return audioFileURL;
                    }
                    catch (ex) {
                        console.log(ex);
                        console.log("Retry audio conversion after 1 second");
                        retries--;
                        yield this.sleep(1000);
                    }
                }
                throw new Error("Failed to convert text to audio file after retries");
            });
        }
        convertToAudioFileKokoro(text) {
            return __awaiter(this, void 0, void 0, function* () {
                let retries = 3;
                while (retries > 0) {
                    try {
                        const selectedVoice = localStorage.getItem("ttsVoice") || "af_heart";
                        const payload = {
                            model: "kokoro",
                            input: text,
                            voice: selectedVoice,
                            response_format: "mp3",
                            download_format: "mp3",
                            speed: 1,
                            volume_multiplier: 1,
                            normalization_options: {
                                normalize: true,
                                unit_normalization: false,
                                url_normalization: true,
                                email_normalization: true,
                                optional_pluralization_normalization: true,
                                phone_normalization: true,
                                replace_remaining_symbols: true
                            }
                        };
                        const response = yield fetch('http://speechtts.homeserver.com/v1/audio/speech', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'audio/mp3'
                            },
                            body: JSON.stringify(payload)
                        });
                        if (!response.ok) {
                            throw new Error("Kokoro TTS request failed");
                        }
                        const audioBlob = yield response.blob();
                        const audioFileURL = URL.createObjectURL(audioBlob);
                        return audioFileURL;
                    }
                    catch (ex) {
                        console.log(ex);
                        console.log("Retry audio conversion (kokoro) after 1 second");
                        retries--;
                        yield this.sleep(1000);
                    }
                }
                throw new Error("Failed to convert text to audio file with kokoro after retries");
            });
        }
        loadChapter(url) {
            return __awaiter(this, void 0, void 0, function* () {
                let self = this;
                let config = AppUtils.getConfiguration();
                console.log(`${AppUtils.getConfiguration().hostName}`);
                let result = yield fetch(`${config.hostName}/page-content-reader?requestURL=${url}&spellCorrectEnabled=${this.spellCorrectEnabled()}`);
                let i = 1;
                let response = yield result.json();
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
                    fetch(`${config.hostName}/page-content-reader?requestURL=${this.nextChapterURL()}&spellCorrectEnabled=${this.spellCorrectEnabled()}`);
                }
                document.querySelectorAll('.paragraph').forEach((el) => {
                    el.addEventListener('click', (event) => {
                        if (event.target instanceof HTMLElement) {
                            console.log("P Clicked " + event.target.id);
                            let paragphNumber = parseInt(event.target.id.replace("paragraph-", ""));
                            self.playFromParagraph(paragphNumber - 1);
                        }
                    });
                });
                if (self.playerControls.playEnabled()) {
                    this.playFromParagraph(0);
                }
            });
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
            return __awaiter(this, void 0, void 0, function* () {
                let self = this;
                yield self.audioPlayer.pause();
                self.playerControls.playEnabled(false);
            });
        }
        playAction() {
            let self = this;
            self.playerControls.playEnabled(true);
            self.playFromParagraph(self.currentLineNumber());
        }
        speakWithBrowserTTS(text, rate) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve) => {
                    window.speechSynthesis.cancel();
                    const utterance = new window.SpeechSynthesisUtterance(text);
                    utterance.rate = rate || 1.0;
                    utterance.onend = () => resolve();
                    utterance.onerror = () => resolve();
                    try {
                        window.speechSynthesis.speak(utterance);
                    }
                    catch (e) {
                        resolve();
                    }
                });
            });
        }
        disconnected() {
            if (this._keydownHandler) {
                document.removeEventListener('keydown', this._keydownHandler);
            }
        }
    }
    return MyReaderViewModel;
});
