import * as AppUtils from "../appUtils";
import * as ko from "knockout";
import "oj-c/input-text";
import "ojs/ojformlayout";
import "oj-c/button";
import "ojs/ojswitch";
import "oj-c/input-number";
type PlayerControlsType = {
    playEnabled: ko.Observable;
};
type Paragraph = {
    id: number;
    text: string;
    audioFile: undefined | Promise<string>;
};
declare class MyReaderViewModel {
    inputURL: ko.Observable<string>;
    novelParagraphs: ko.ObservableArray<ko.Observable<Paragraph>>;
    playerControls: PlayerControlsType;
    currentLineNumber: ko.Observable<number>;
    config: AppUtils.Configuration;
    nextChapterURL: ko.Observable<string | undefined>;
    playbackRate: ko.Observable<number>;
    audioPlayer: any;
    audioSource: any;
    spellCorrectEnabled: ko.Observable<boolean>;
    loadCounter: number;
    constructor();
    connected(): void;
    disconnected(): void;
    transitionCompleted(): void;
    loadNextChapter(): Promise<void>;
    navigateToChapter(chapterURL: string, autoPlay: boolean, playbackRate: number): Promise<void>;
    playFromParagraph(pNumber: number): Promise<void>;
    sleep(time: number): Promise<void>;
    convertToAudioFile(text: string): Promise<string>;
    loadChapter(url: string): Promise<void>;
    scrollToTargetAdjusted(element: any): void;
    onLoadURLButtonClicked: (event: any) => void;
    onParagraphClicked: (event: Event) => void;
    playButtonClicked: (event: Event) => void;
    pauseButtonClicked: (event: Event) => void;
    nextButtonClicked: (event: Event) => void;
    prevButtonClicked: (event: Event) => void;
    pauseAction(): void;
    playAction(): void;
}
export = MyReaderViewModel;
