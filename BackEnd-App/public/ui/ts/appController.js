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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
const ko = __importStar(require("knockout"));
const ResponsiveUtils = __importStar(require("ojs/ojresponsiveutils"));
const ResponsiveKnockoutUtils = __importStar(require("ojs/ojresponsiveknockoututils"));
const CoreRouter = require("ojs/ojcorerouter");
const ModuleRouterAdapter = require("ojs/ojmodulerouter-adapter");
const KnockoutRouterAdapter = require("ojs/ojknockoutrouteradapter");
const UrlParamAdapter = require("ojs/ojurlparamadapter");
const ArrayDataProvider = require("ojs/ojarraydataprovider");
require("ojs/ojknockout");
require("ojs/ojmodule-element");
const Context = require("ojs/ojcontext");
;
class RootViewModel {
    constructor() {
        this.announcementHandler = (event) => {
            this.message(event.detail.message);
            this.manner(event.detail.manner);
        };
        // handle announcements sent when pages change, for Accessibility.
        this.manner = ko.observable("polite");
        this.message = ko.observable();
        let globalBodyElement = document.getElementById("globalBody");
        globalBodyElement.addEventListener("announce", this.announcementHandler, false);
        // media queries for responsive layouts
        let smQuery = ResponsiveUtils.getFrameworkQuery("sm-only");
        if (smQuery) {
            this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
        }
        const navData = [
            { path: "", redirect: "dashboard" },
            { path: "dashboard", detail: { label: "Dashboard", iconClass: "oj-ux-ico-bar-chart" } },
            { path: "incidents", detail: { label: "Incidents", iconClass: "oj-ux-ico-fire" } },
            { path: "customers", detail: { label: "Customers", iconClass: "oj-ux-ico-contact-group" } },
            { path: "about", detail: { label: "About", iconClass: "oj-ux-ico-information-s" } },
            { path: "MyReader", detail: { label: "My Reader", iconClass: "oj-ux-ico-information-s" } },
            { path: "ImageSlider", detail: { label: "Image Slider", iconClass: "oj-ux-ico-information-s" } }
        ];
        // router setup
        const router = new CoreRouter(navData, {
            urlAdapter: new UrlParamAdapter()
        });
        router.sync();
        // module config
        this.moduleAdapter = new ModuleRouterAdapter(router);
        this.selection = new KnockoutRouterAdapter(router);
        // Setup the navDataProvider with the routes, excluding the first redirected
        // route.
        this.navDataProvider = new ArrayDataProvider(navData.slice(1), { keyAttributes: "path" });
        // header
        // application Name used in Branding Area
        this.appName = ko.observable("App Name");
        // user Info used in Global Navigation area
        this.userLogin = ko.observable("john.hancock@oracle.com");
        // footer
        this.footerLinks = [
            { name: 'About Oracle', linkId: 'aboutOracle', linkTarget: 'http://www.oracle.com/us/corporate/index.html#menu-about' },
            { name: "Contact Us", id: "contactUs", linkTarget: "http://www.oracle.com/us/corporate/contact/index.html" },
            { name: "Legal Notices", id: "legalNotices", linkTarget: "http://www.oracle.com/us/legal/index.html" },
            { name: "Terms Of Use", id: "termsOfUse", linkTarget: "http://www.oracle.com/us/legal/terms/index.html" },
            { name: "Your Privacy Rights", id: "yourPrivacyRights", linkTarget: "http://www.oracle.com/us/legal/privacy/index.html" },
        ];
        // release the application bootstrap busy state
        Context.getPageContext().getBusyContext().applicationBootstrapComplete();
    }
}
exports.default = new RootViewModel();
