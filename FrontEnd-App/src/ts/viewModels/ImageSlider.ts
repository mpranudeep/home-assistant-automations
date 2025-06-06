/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
import * as AccUtils from "../accUtils";
import * as ko from 'knockout';
import 'ojs/ojbutton';
import 'ojs/ojmodule-element';
import * as $ from 'jquery';
import ArrayDataProvider = require('ojs/ojarraydataprovider');
import { ojMessage } from 'ojs/ojmessage';
import 'ojs/ojmessages';
import 'ojs/ojselectcombobox';

class Image {
    link: string = "";
    preview: string = "";
    title: string = "";
}

class ImageSliderViewModel {
      images: ko.ObservableArray<Image>;
      currentImageIndex: ko.Observable<number>;
      currentImage: ko.Computed<Image | null>;
      hasNext: ko.Observable<boolean>;
      pageIndex : number = 1;
      isFetching:boolean = false;
      scale : number = 1;
      message:any = ko.observable();
      messagesDataprovider:any;
      app = ko.observable();

  constructor() {

         let url = new URL(window.location.href);
         this.app(url.searchParams.get("app"));

          this.app.subscribe((value)=>{
                  let url = new URL(window.location.href);
                  url.searchParams.set("app", value);
                  window.location.href = url.toString();
          })



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
          $(document).on('keydown', (e:any) => this.handleKeydown(e));

            this.message(
                  {
                    severity: 'info',
                    summary: 'Info message summary no detail',
                    autoTimeout : 1000
                  }
                );
           this.messagesDataprovider = ko.computed(()=>{
                console.log(self.message());
                return new ArrayDataProvider([self.message()]);
            }
           );
  }

   // Fetch images from a REST API
    fetchImages() {
        let self = this;
        if(self.isFetching){
            return;
        }
        if(!self.hasNext()){
            return;
        }
        self.isFetching = true;
        let url = new URL(window.location.href);
        let params: any = new URLSearchParams(url.search);
        let link = params.get('link');

        let imgURL = `http://localhost:9090/api/posts?index=${this.images().length}&app=${this.app()}`;

        if(link){
            imgURL = `http://localhost:9090/api/detailPost?page=${this.pageIndex}&link=${link}&app=${this.app()}`
            this.pageIndex++;
        }
        this.message({
                      severity: 'info',
                      summary: 'Fetching images',
                      autoTimeout : 1000
                    });

        $.ajax({
            url: imgURL,
            method: 'GET',
            dataType: 'json',
            success: (response:any) => {
                for(let eachImage of response.items){
                    this.images.push(eachImage)
                }
                self.hasNext(response.hasNext);
                self.isFetching = false;
            },
            error: (error:any) => {
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
                                              autoTimeout : 1000
                                            });
          } else {
              this.currentImageIndex(newIndex);
          }
      }

      // Navigate to the next slide
      nextSlide() {
          let self = this;
          const newIndex = this.currentImageIndex() + 1;
          let remainingImages = this.images().length - newIndex;
          if(remainingImages<15){
            self.fetchImages();
          }

          if (newIndex >= this.images().length) {
                    this.message({
                                severity: 'info',
                                summary: 'No more images found',
                                autoTimeout : 1000
                                }
                              );
              console.log("No more images present");
          } else {
              this.currentImageIndex(newIndex);
          }
      }

      openDetailPost(){
          let currentImage = this.currentImage();
          let link = currentImage?.link;

          if(link){
             let url = `/?ojr=ImageSlider&link=${encodeURI(link)}`;
             window.open(url, "_blank");
          }
      }

 // Function to update zoom level
      updateZoom() {
          let element = document.getElementById('imageSliderContainer');
          if(element){
            element.style.transform = `scale(${this.scale})`;
          }
//           document.body.style.transform = `scale(${this.scale})`;
      }

      // Handle keyboard navigation (left and right arrows)
      handleKeydown(event: JQuery.Event) {
          if (event.key === 'ArrowRight') {
              this.nextSlide();
          } else if (event.key === 'ArrowLeft') {
              this.prevSlide();
          }else if (event.key === "Enter"){
              this.openDetailPost();
          } if (event.key === "+") {
                           this.scale += 0.1; // Increase scale
                           this.updateZoom();
                       } else if (event.key === "-") {
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
  connected(): void {
    AccUtils.announce("Image viewer loaded.");
    document.title = "Image viewer";
    // implement further logic if needed
            this.currentImage.subscribe(x=>{
                        if(x){
                        let videoElement = document.getElementById("videoElement");
                        if(videoElement){
                            // @ts-ignore
                            videoElement.load();
                            // @ts-ignore
                            videoElement.play();
                        }
                        // @ts-ignore
                        document.title =x.title;
                        }
              });
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
}

export = ImageSliderViewModel;
