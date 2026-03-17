import * as ko from "knockout";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
type Novel = {
    id: string;
    name: string;
    sources: Source[];
};
type Source = {
    id: string;
    name: string;
    translateEnabled: boolean;
    refinementEnabled: boolean;
};
declare class NovelsViewModel {
    novelsArray: ko.ObservableArray<Novel>;
    novels: ArrayDataProvider<unknown, unknown>;
    newNovelName: ko.Observable<string>;
    newSourceName: ko.Observable<string>;
    newSourceFlags: ko.ObservableArray<string>;
    progressMap: ko.Observable<Record<string, string>>;
    constructor();
    fetchNovels(): Promise<void>;
    addNovel(event: CustomEvent): Promise<void>;
    deleteNovel(novel: Novel): Promise<void>;
    addSource(novel: Novel, event: CustomEvent): Promise<void>;
    deleteSource(novel: Novel, source: Source): Promise<void>;
    getProgress(source: Source): string;
    setProgress(novelId: string, sourceId: string, val: string): Promise<void>;
    loadProgressAll(): Promise<void>;
    getUserId(): string;
    editNovel(novel: Novel): void;
    editSource(source: Source): void;
}
export = NovelsViewModel;
