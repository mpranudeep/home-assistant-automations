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
const ko = __importStar(require("knockout"));
require("ojs/ojbutton");
require("ojs/ojmodule-element");
const $ = __importStar(require("jquery"));
const ArrayDataProvider = require("ojs/ojarraydataprovider");
require("ojs/ojmessages");
require("ojs/ojselectcombobox");
class Image {
    constructor() {
        this.link = "";
        this.preview = "";
        this.title = "";
    }
}
class ImageSliderViewModel {
    constructor() {
        this.pageIndex = 1;
        this.isFetching = false;
        this.scale = 1;
        this.message = ko.observable();
        this.app = ko.observable();
        let url = new URL(window.location.href);
        this.app(url.searchParams.get("app"));
        this.app.subscribe((value) => {
            let url = new URL(window.location.href);
            url.searchParams.set("app", value);
            window.location.href = url.toString();
        });
        // @ts-ignore
        this.images = ko.observableArray([]);
        this.currentImageIndex = ko.observable(0);
        this.hasNext = ko.observable(true);
        // Computed observable for the current image being shown
        this.currentImage = ko.computed(() => {
            if (this.images().length > 0) {
                return this.images()[this.currentImageIndex()];
            }
            return null;
        });
        // Fetch images on ViewModel initialization
        this.fetchImages();
        let self = this;
        // Bind keyboard events
        $(document).on('keydown', (e) => this.handleKeydown(e));
        this.message({
            severity: 'info',
            summary: 'Info message summary no detail',
            autoTimeout: 1000
        });
        this.messagesDataprovider = ko.computed(() => {
            console.log(self.message());
            return new ArrayDataProvider([self.message()]);
        });
    }
    // Fetch images from a REST API
    fetchImages() {
        let self = this;
        if (self.isFetching) {
            return;
        }
        if (!self.hasNext()) {
            return;
        }
        self.isFetching = true;
        let url = new URL(window.location.href);
        let params = new URLSearchParams(url.search);
        let link = params.get('link');
        let imgURL = `http://localhost:9090/api/posts?index=${this.images().length}&app=${this.app()}`;
        if (link) {
            imgURL = `http://localhost:9090/api/detailPost?page=${this.pageIndex}&link=${link}&app=${this.app()}`;
            this.pageIndex++;
        }
        this.message({
            severity: 'info',
            summary: 'Fetching images',
            autoTimeout: 1000
        });
        $.ajax({
            url: imgURL,
            method: 'GET',
            dataType: 'json',
            success: (response) => {
                for (let eachImage of response.items) {
                    this.images.push(eachImage);
                }
                self.hasNext(response.hasNext);
                self.isFetching = false;
            },
            error: (error) => {
                console.error('Error fetching images:', error);
                self.isFetching = false;
            }
        });
    }
    // Navigate to the previous slide
    prevSlide() {
        const newIndex = this.currentImageIndex() - 1;
        if (newIndex < 0) {
            console.log("No more images present");
            this.message({
                severity: 'info',
                summary: 'No more images found',
                autoTimeout: 1000
            });
        }
        else {
            this.currentImageIndex(newIndex);
        }
    }
    // Navigate to the next slide
    nextSlide() {
        let self = this;
        const newIndex = this.currentImageIndex() + 1;
        let remainingImages = this.images().length - newIndex;
        if (remainingImages < 15) {
            self.fetchImages();
        }
        if (newIndex >= this.images().length) {
            this.message({
                severity: 'info',
                summary: 'No more images found',
                autoTimeout: 1000
            });
            console.log("No more images present");
        }
        else {
            this.currentImageIndex(newIndex);
        }
    }
    openDetailPost() {
        let currentImage = this.currentImage();
        let link = currentImage?.link;
        if (link) {
            let url = `/?ojr=ImageSlider&link=${encodeURI(link)}`;
            window.open(url, "_blank");
        }
    }
    // Function to update zoom level
    updateZoom() {
        let element = document.getElementById('imageSliderContainer');
        if (element) {
            element.style.transform = `scale(${this.scale})`;
        }
        //           document.body.style.transform = `scale(${this.scale})`;
    }
    // Handle keyboard navigation (left and right arrows)
    handleKeydown(event) {
        if (event.key === 'ArrowRight') {
            this.nextSlide();
        }
        else if (event.key === 'ArrowLeft') {
            this.prevSlide();
        }
        else if (event.key === "Enter") {
            this.openDetailPost();
        }
        if (event.key === "+") {
            this.scale += 0.1; // Increase scale
            this.updateZoom();
        }
        else if (event.key === "-") {
            if (this.scale > 0.1) { // Prevent scale from going below 0.1
                this.scale -= 0.1; // Decrease scale
                this.updateZoom();
            }
        }
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
        AccUtils.announce("Image viewer loaded.");
        document.title = "Image viewer";
        // implement further logic if needed
        this.currentImage.subscribe(x => {
            if (x) {
                let videoElement = document.getElementById("videoElement");
                if (videoElement) {
                    // @ts-ignore
                    videoElement.load();
                    // @ts-ignore
                    videoElement.play();
                }
                // @ts-ignore
                document.title = x.title;
            }
        });
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
}
module.exports = ImageSliderViewModel;
