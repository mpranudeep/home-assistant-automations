define(["require", "exports", "knockout", "ojs/ojresponsiveutils", "ojs/ojresponsiveknockoututils", "ojs/ojcorerouter", "ojs/ojmodulerouter-adapter", "ojs/ojknockoutrouteradapter", "ojs/ojurlparamadapter", "ojs/ojarraydataprovider", "ojs/ojcontext", "ojs/ojknockout", "ojs/ojmodule-element"], function (require, exports, ko, ResponsiveUtils, ResponsiveKnockoutUtils, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter, UrlParamAdapter, ArrayDataProvider, Context) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
    class RootViewModel {
        constructor() {
            this.announcementHandler = (event) => {
                this.message(event.detail.message);
                this.manner(event.detail.manner);
            };
            this.manner = ko.observable("polite");
            this.message = ko.observable();
            let globalBodyElement = document.getElementById("globalBody");
            globalBodyElement.addEventListener("announce", this.announcementHandler, false);
            let smQuery = ResponsiveUtils.getFrameworkQuery("sm-only");
            if (smQuery) {
                this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
            }
            const navData = [
                { path: "MyLogiFlow", detail: { label: "Logitech Flow", iconClass: "oj-ux-ico-information-s" } },
                { path: "MyReader", detail: { label: "My Reader", iconClass: "oj-ux-ico-information-s" } },
                { path: "ImageSlider", detail: { label: "Image Slider", iconClass: "oj-ux-ico-information-s" } }
            ];
            const router = new CoreRouter(navData, {
                urlAdapter: new UrlParamAdapter()
            });
            router.sync();
            this.moduleAdapter = new ModuleRouterAdapter(router);
            this.selection = new KnockoutRouterAdapter(router);
            this.navDataProvider = new ArrayDataProvider(navData.slice(1), { keyAttributes: "path" });
            this.appName = ko.observable("App Name");
            this.userLogin = ko.observable("john.hancock@oracle.com");
            this.footerLinks = [
                { name: 'About Oracle', linkId: 'aboutOracle', linkTarget: 'http://www.oracle.com/us/corporate/index.html#menu-about' },
                { name: "Contact Us", id: "contactUs", linkTarget: "http://www.oracle.com/us/corporate/contact/index.html" },
                { name: "Legal Notices", id: "legalNotices", linkTarget: "http://www.oracle.com/us/legal/index.html" },
                { name: "Terms Of Use", id: "termsOfUse", linkTarget: "http://www.oracle.com/us/legal/terms/index.html" },
                { name: "Your Privacy Rights", id: "yourPrivacyRights", linkTarget: "http://www.oracle.com/us/legal/privacy/index.html" },
            ];
            Context.getPageContext().getBusyContext().applicationBootstrapComplete();
        }
    }
    exports.default = new RootViewModel();
});
