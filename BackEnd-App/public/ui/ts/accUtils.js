"use strict";
/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/**
 * @license
 * Copyright (c) 2014, 2018, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your application specific code will go here
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.announce = announce;
/**
 * Method for sending notifications to the aria-live region for Accessibility.
 * Sending a notice when the page is loaded, as well as changing the page title
 * is considered best practice for making Single Page Applications Accessbible.
 */
let validAriaLiveValues = ["off", "polite", "assertive"];
function announce(message, manner) {
    if (manner === undefined || validAriaLiveValues.indexOf(manner) === -1) {
        manner = "polite";
    }
    let params = {
        "bubbles": true,
        "detail": { "message": message, "manner": manner }
    };
    let globalBodyElement = document.getElementById("globalBody");
    globalBodyElement.dispatchEvent(new CustomEvent("announce", params));
}
