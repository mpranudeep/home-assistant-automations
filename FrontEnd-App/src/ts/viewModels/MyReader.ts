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
    let self = this;
    this.inputURL = ko.observable("https://fast.novelupdates.net/book/shadow-slave/chapter-1735-toast-to-loyalty");
    this.novelParagraphs = ko.observableArray();
    this.playerControls = {
      playEnabled: ko.observable(false)
    }

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
    let self = this;
    AccUtils.announce("My Reader Page TS");
    document.title = "My Reader";
    // implement further logic if needed
    this.audioPlayer = document.getElementById('audioPlayer');



      this.playbackRate.subscribe(function(newValue) {
      // @ts-ignore
       self.audioPlayer.playbackRate = parseFloat(newValue);
      });

    this.audioSource = document.getElementById('audioSource');

    this.audioPlayer.addEventListener('ended', function () {
      self.playFromParagraph(self.currentLineNumber() + 1);
    });

    let url = new URL(window.location.href);
    let params: any = new URLSearchParams(url.search);
    let urlInputURL = params.get('inputURL');

    let autoPlayEnabled = params.get('autoPlay');
    if (autoPlayEnabled == 'true') {
      self.playerControls.playEnabled(true);
    }

    let  spellCorrectEnabled = params.get('spellCorrectEnabled');
    if(spellCorrectEnabled=='true'){
        self.spellCorrectEnabled(true);
    } else{
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

      if(event.key === ' '){
        if(self.playerControls.playEnabled())
        {
          self.pauseAction();
        }else{
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
  disconnected(): void {
    // implement if needed
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
      for (let eachP of self.novelParagraphs()) {
        let eachPO: Paragraph = eachP();
        if (eachPO.audioFile) {
          let filePath = await eachPO.audioFile;
          let deleteURL = `${this.config.hostName}/api/text-to-speech/delete-file?filePath=${filePath}`;
          await fetch(deleteURL);
        }
      }
      let url = new URL(window.location.href);
      url.searchParams.set("inputURL", chapterURL);
      if(autoPlay){
        url.searchParams.set("autoPlay", "true");
      }else{
        url.searchParams.set("autoPlay", "false");
      }

      if(self.spellCorrectEnabled()){
        url.searchParams.set("spellCorrectEnabled","true");
      }else{
        url.searchParams.set("spellCorrectEnabled","false");
      }
      if(playbackRate){
        url.searchParams.set("playbackRate", playbackRate + "");
      }
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

  async sleep(time: number) {
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        // @ts-ignore
        resolve();
      }, time);
    });
    await promise;
  }

  async convertToAudioFile(text: string) {

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
      } catch (ex) {
        console.log(ex);
        this.sleep(1000);
      }
    }
  }

  async loadChapter(url: string): Promise<void> {
    let self = this;
    let config = AppUtils.getConfiguration();
    console.log(`${AppUtils.getConfiguration().hostName}`);
    let result = await fetch(`${config.hostName}/api/novel-content?requestURL=${url}&spellCorrectEnabled=${this.spellCorrectEnabled()}`);
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
    if(this.nextChapterURL()){
      fetch(`${config.hostName}/api/novel-content?requestURL=${this.nextChapterURL()}&spellCorrectEnabled=${this.spellCorrectEnabled()}`);
    }
    

    // @ts-ignore
    $(".paragraph").click(function (event) {
      console.log("P Clicked " + event.target.id);
      let paragphNumber: number = parseInt(event.target.id.replace("paragraph-", ""));
      self.playFromParagraph(paragphNumber - 1);
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

export = MyReaderViewModel;