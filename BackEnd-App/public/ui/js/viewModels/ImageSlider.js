define(["require", "exports", "../accUtils", "knockout", "jquery", "ojs/ojarraydataprovider", "ojs/ojbutton", "ojs/ojmodule-element", "ojs/ojmessages", "ojs/ojselectcombobox"], function (require, exports, AccUtils, ko, $, ArrayDataProvider) {
    "use strict";
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
            this.images = ko.observableArray([]);
            this.currentImageIndex = ko.observable(0);
            this.hasNext = ko.observable(true);
            this.currentImage = ko.computed(() => {
                if (this.images().length > 0) {
                    return this.images()[this.currentImageIndex()];
                }
                return null;
            });
            this.fetchImages();
            let self = this;
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
            let link = currentImage === null || currentImage === void 0 ? void 0 : currentImage.link;
            if (link) {
                let url = `/?ojr=ImageSlider&link=${encodeURI(link)}`;
                window.open(url, "_blank");
            }
        }
        updateZoom() {
            let element = document.getElementById('imageSliderContainer');
            if (element) {
                element.style.transform = `scale(${this.scale})`;
            }
        }
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
                this.scale += 0.1;
                this.updateZoom();
            }
            else if (event.key === "-") {
                if (this.scale > 0.1) {
                    this.scale -= 0.1;
                    this.updateZoom();
                }
            }
        }
        connected() {
            AccUtils.announce("Image viewer loaded.");
            document.title = "Image viewer";
            this.currentImage.subscribe(x => {
                if (x) {
                    let videoElement = document.getElementById("videoElement");
                    if (videoElement) {
                        videoElement.load();
                        videoElement.play();
                    }
                    document.title = x.title;
                }
            });
        }
        disconnected() {
        }
        transitionCompleted() {
        }
    }
    return ImageSliderViewModel;
});
//# sourceMappingURL=ImageSlider.js.map