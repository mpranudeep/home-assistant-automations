/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
import * as AccUtils from "../accUtils";
import * as AppUtils from "../appUtils";
import * as ko from "knockout";
import { BindForEachElement } from "ojs/ojknockout";

import "oj-c/input-text";
import "ojs/ojformlayout";
import "oj-c/button";
import "ojs/ojswitch";
import "oj-c/input-number";

type PlayerControlsType = {
  playEnabled: ko.Observable
}

type Paragraph = {
  id: number,
  text: string,
  audioFile: undefined | Promise<string>
}

class MyReaderViewModel {

  inputURL: ko.Observable<string>;
  novelParagraphs: ko.ObservableArray<ko.Observable<Paragraph>>;
  playerControls: PlayerControlsType;
  currentLineNumber: ko.Observable<number>;
  config: AppUtils.Configuration;
  nextChapterURL: ko.Observable<string | undefined>;
  playbackRate : ko.Observable<number>;
  audioPlayer: any;
  audioSource: any;
  spellCorrectEnabled: ko.Observable<boolean>;
  loadCounter = 8;

  constructor() {
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
  connected(): void {
    AccUtils.announce("My Reader Page TS");
    document.title = "My Reader";
    // implement further logic if needed

    this.audioPlayer = document.getElementById('audioPlayer');
    this.audioSource = document.getElementById('audioSource');

    this.playbackRate.subscribe((newValue) => {
      // @ts-ignore
      this.audioPlayer.playbackRate = parseFloat(newValue);
    });

    if (this.audioPlayer) {
      this.audioPlayer.addEventListener('ended', () => {
        this.playFromParagraph(this.currentLineNumber() + 1);
      });
    }

    const url = new URL(window.location.href);
    const params: any = new URLSearchParams(url.search);
    const urlInputURL = params.get('inputURL');
    if (urlInputURL) {
      this.inputURL(urlInputURL);
      this.loadChapter(this.inputURL());
    }

    // Read preferences from storage for other settings
    const storedAutoPlay = localStorage.getItem('autoPlay');
    const storedSpellCorrectEnabled = localStorage.getItem('spellCorrectEnabled');
    const storedPlaybackRate = localStorage.getItem('playbackRate');

    this.playerControls.playEnabled(storedAutoPlay === 'true');
    this.spellCorrectEnabled(storedSpellCorrectEnabled === 'true');
    this.playbackRate(storedPlaybackRate !== null ? parseFloat(storedPlaybackRate) : 1);

    // To avoid duplicate event registrations, ensure this is only added once.
    if (!this._keydownHandler) {
      this._keydownHandler = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') {
          this.loadNextChapter();
        }

        if (event.key === 'a' || event.key === 'A') {
          this.playFromParagraph(this.currentLineNumber() + 1);
        }
        if (event.key === ' ') {
          if (this.playerControls.playEnabled()) {
            this.pauseAction();
          } else {
            this.playAction();
          }
          event.preventDefault();
        }
      };
      document.addEventListener('keydown', this._keydownHandler);
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        // this.playAction();
        console.log('Play event');
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        // this.pauseAction();
        console.log('Pause event');
      });
    }

    document.body.classList.add('sepia-mode');
  }


  /**
   * Optional ViewModel method invoked after transition to the new View is complete.
   * That includes any possible animation between the old and the new View.
   */
  transitionCompleted(): void {
    // implement if needed
  }

  async loadNextChapter() {
    let self = this;
    let nextChapterURL: string | undefined = this.nextChapterURL();
    if (nextChapterURL) {
      this.navigateToChapter(nextChapterURL,self.playerControls.playEnabled(),self.playbackRate());
    }
  }

  async navigateToChapter(chapterURL: string,autoPlay:boolean, playbackRate:number) {
    let self = this;
    if (chapterURL) {
      const ttsEngine = localStorage.getItem("ttsEngine") || "piper";
      if (ttsEngine === "piper") {
        for (let eachP of self.novelParagraphs()) {
          let eachPO: Paragraph = eachP();
          if (eachPO.audioFile) {
            let filePath = await eachPO.audioFile;
            let deleteURL = `${this.config.hostName}/api/text-to-speech/delete-file?filePath=${filePath}`;
            await fetch(deleteURL);
          }
        }
      }
      let url = new URL(window.location.href);
      url.searchParams.set("inputURL", chapterURL);
      window.location.href = url.toString();
    }
  }

  async playFromParagraph(pNumber: number) {
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

    if(this.loadCounter<10){
        this.loadCounter=this.loadCounter+1;
    }

    for (let i = pNumber; i <= (pNumber + this.loadCounter) && i < this.novelParagraphs().length; i++) {
      let item: Paragraph = this.novelParagraphs()[i]();
      if (!item.audioFile) {
        // Check ttsengine from localStorage, valid values: "piper", "kokoro", "browser"
        const ttsEngine = localStorage.getItem("ttsEngine") || "piper";
        if (ttsEngine === "piper") {
          item.audioFile = self.convertToAudioFilePiper(item.text);
        } else if (ttsEngine === "kokoro") {
          item.audioFile = self.convertToAudioFileKokoro(item.text);
        } else if (ttsEngine === "browser") {
          // For the browser, flag to use speech synthesis live (not file-based)
          item.audioFile = Promise.resolve("BROWSER_TTS");
        }
      }
    }
    // Check TTS engine for current playback
    const ttsEngineCurrent = localStorage.getItem("ttsEngine") || "piper";
    let currentP = this.novelParagraphs()[pNumber]();

    if (ttsEngineCurrent === "browser") {
      // Use browser speech, no audio player
      // @ts-ignore
      await self.speakWithBrowserTTS(currentP.text, parseFloat(self.playbackRate()));

      // On speech end, advance to next
      this.currentLineNumber(pNumber + 1);
      if (this.currentLineNumber() < this.novelParagraphs().length) {
        // If there are more paragraphs, continue
        if (this.playerControls.playEnabled()) {
          await this.playFromParagraph(this.currentLineNumber());
        }
      } else {
        // End of chapter
        this.loadNextChapter();
      }
      return;
    }

    let audioFileURL = await currentP.audioFile;
    self.audioSource.src = audioFileURL;

    let retryCounter = 3;
    
    while(retryCounter>0){
      try{
          await self.audioPlayer.load();
          retryCounter=0;
        }catch(error){
            console.log(error);
            console.log("Retry loading after 1 second");
            retryCounter--;
            await this.sleep(1000);
        } 
    }
    
    // @ts-ignore
    self.audioPlayer.playbackRate = parseFloat(self.playbackRate());
    await self.audioPlayer?.play();

    let targetP = document.getElementById('paragraph-' + (pNumber + 1));
    self.scrollToTargetAdjusted(targetP);
  }

  async sleep(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  async convertToAudioFilePiper(text: string) {
    let retries = 3;
    while (retries > 0) {
      try {
        let convertedResponse = await fetch(`${this.config.hostName}/api/text-to-speech/convert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });

        let response = await convertedResponse.json();
        let filePath = encodeURI(response.audioFilePath);
        let audioFileURL = `${this.config.hostName}/api/text-to-speech/get-file?filePath=${filePath}`;
        return audioFileURL;
      } catch (ex) {
        console.log(ex);
        console.log("Retry audio conversion after 1 second");
        retries--;
        await this.sleep(1000);
      }
    }
    throw new Error("Failed to convert text to audio file after retries");
  }

  async convertToAudioFileKokoro(text: string) {
    let retries = 3;
    while (retries > 0) {
      try {
        // Read selected voice from localStorage, fallback to af_heart if missing
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

        const response = await fetch('http://speechtts.homeserver.com/v1/audio/speech', {
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
        const audioBlob = await response.blob();
        // Clean up previous BlobUrl if needed (optional, not tracked now)
        const audioFileURL = URL.createObjectURL(audioBlob);
        return audioFileURL;
      } catch (ex) {
        console.log(ex);
        console.log("Retry audio conversion (kokoro) after 1 second");
        retries--;
        await this.sleep(1000);
      }
    }
    throw new Error("Failed to convert text to audio file with kokoro after retries");
  }

  async loadChapter(url: string): Promise<void> {
    let self = this;
    let config = AppUtils.getConfiguration();
    console.log(`${AppUtils.getConfiguration().hostName}`);
    let result = await fetch(`${config.hostName}/page-content-reader?requestURL=${url}&spellCorrectEnabled=${this.spellCorrectEnabled()}`);
    let i = 1;
    let response = await result.json();
    // @ts-ignore
    for (let eachLine of response.items) {
      let eachP: Paragraph = {
        id: i++,
        text: eachLine.line,
        audioFile: undefined
      }
      let ob = ko.observable(eachP);
      self.novelParagraphs.push(ob);
    }

    this.nextChapterURL(response.nextChapterURL);
    if (this.nextChapterURL()) {
      fetch(`${config.hostName}/page-content-reader?requestURL=${this.nextChapterURL()}&spellCorrectEnabled=${this.spellCorrectEnabled()}`);
    }

    // Prefer modern event delegation if possible (instead of jQuery).
    document.querySelectorAll('.paragraph').forEach((el) => {
      el.addEventListener('click', (event: Event) => {
        if (event.target instanceof HTMLElement) {
          console.log("P Clicked " + event.target.id);
          let paragphNumber: number = parseInt(event.target.id.replace("paragraph-", ""));
          self.playFromParagraph(paragphNumber - 1);
        }
      });
    });

    if (self.playerControls.playEnabled()) {
      this.playFromParagraph(0);
    }
  }

  scrollToTargetAdjusted(element: any) {
    var headerOffset = 150;
    var elementPosition = element.getBoundingClientRect().top;
    var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }


  public onLoadURLButtonClicked = (event: any) => {
    let mainURL = this.inputURL();
    if (mainURL) {
      this.navigateToChapter(mainURL,false,this.playbackRate());
    }
  }

  public onParagraphClicked = (event: Event) => {
    console.log("On Paragraph clicked");
  }

  public playButtonClicked = (event: Event) => {
    this.playAction();
  }

  public pauseButtonClicked = (event: Event) => {
    this.pauseAction();
  }

  public nextButtonClicked = (event: Event) => {
    let self = this;
    self.loadNextChapter();
  }

  public prevButtonClicked = (event: Event) => {
    let self = this;
    self.playFromParagraph(self.currentLineNumber() - 1);
  }

  async pauseAction() {
    let self = this;
    await self.audioPlayer.pause();
    self.playerControls.playEnabled(false);
  }

  playAction() {
    let self = this;
    self.playerControls.playEnabled(true);
    self.playFromParagraph(self.currentLineNumber());
  }

  // Browser-based Speech Synthesis for TTS
  async speakWithBrowserTTS(text: string, rate: number) : Promise<void> {
    return new Promise((resolve) => {
      // Cancel any currently speaking.
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = rate || 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Fail gracefully
        resolve();
      }
    });
  }

  // Optional: Clean up event listeners when disconnected
  private _keydownHandler?: (event: KeyboardEvent) => void;

  disconnected(): void {
    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler);
    }
  }
}

export = MyReaderViewModel;
