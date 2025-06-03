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
        connected() {
            let self = this;
            AccUtils.announce("My Reader Page TS");
            document.title = "My Reader";
            this.audioPlayer = document.getElementById('audioPlayer');
            this.playbackRate.subscribe(function (newValue) {
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
                if (event.key === 'a' || event.key === 'A') {
                    self.playFromParagraph(self.currentLineNumber() + 1);
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
                    console.log('Play event');
                });
                navigator.mediaSession.setActionHandler('pause', () => {
                    console.log('Pause event');
                });
            }
            document.body.classList.add('sepia-mode');
        }
        disconnected() {
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
                    for (let eachP of self.novelParagraphs()) {
                        let eachPO = eachP();
                        if (eachPO.audioFile) {
                            let filePath = yield eachPO.audioFile;
                            let deleteURL = `${this.config.hostName}/api/text-to-speech/delete-file?filePath=${filePath}`;
                            yield fetch(deleteURL);
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
                        item.audioFile = self.convertToAudioFile(item.text);
                    }
                }
                let currentP = this.novelParagraphs()[pNumber]();
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
                let promise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve();
                    }, time);
                });
                yield promise;
            });
        }
        convertToAudioFile(text) {
            return __awaiter(this, void 0, void 0, function* () {
                while (true) {
                    try {
                        let convertedResponse = yield fetch(`${this.config.hostName}/api/text-to-speech/convert`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                "text": text
                            })
                        });
                        let response = yield convertedResponse.json();
                        let filePath = response.audioFilePath;
                        filePath = encodeURI(filePath);
                        let audioFileURL = `${this.config.hostName}/api/text-to-speech/get-file?filePath=${filePath}`;
                        return audioFileURL;
                    }
                    catch (ex) {
                        console.log(ex);
                        this.sleep(1000);
                    }
                }
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
                $(".paragraph").click(function (event) {
                    console.log("P Clicked " + event.target.id);
                    let paragphNumber = parseInt(event.target.id.replace("paragraph-", ""));
                    self.playFromParagraph(paragphNumber - 1);
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
    }
    return MyReaderViewModel;
});
