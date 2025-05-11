/// <reference types="jquery" />
import * as ko from 'knockout';
import 'ojs/ojbutton';
import 'ojs/ojmodule-element';
import 'ojs/ojmessages';
import 'ojs/ojselectcombobox';
declare class Image {
    link: string;
    preview: string;
    title: string;
}
declare class ImageSliderViewModel {
    images: ko.ObservableArray<Image>;
    currentImageIndex: ko.Observable<number>;
    currentImage: ko.Computed<Image | null>;
    hasNext: ko.Observable<boolean>;
    pageIndex: number;
    isFetching: boolean;
    scale: number;
    message: any;
    messagesDataprovider: any;
    app: ko.Observable<any>;
    constructor();
    fetchImages(): void;
    prevSlide(): void;
    nextSlide(): void;
    openDetailPost(): void;
    updateZoom(): void;
    handleKeydown(event: JQuery.Event): void;
    connected(): void;
    disconnected(): void;
    transitionCompleted(): void;
}
export = ImageSliderViewModel;
