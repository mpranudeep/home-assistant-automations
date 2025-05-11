"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findInputSensitiveText = exports.InputSensitiveTextWebElement = void 0;
var oraclejet_webdriver_1 = require("@oracle/oraclejet-webdriver");
var InputSensitiveTextWebElement_1 = require("./InputSensitiveTextWebElement");
Object.defineProperty(exports, "InputSensitiveTextWebElement", { enumerable: true, get: function () { return InputSensitiveTextWebElement_1.InputSensitiveTextWebElement; } });
/**
 * Retrieve an instance of [InputSensitiveTextWebElement](../classes/InputSensitiveTextWebElement.html).
 * @example
 * ```javascript
 * import { findInputSensitiveText } from '@oracle/oraclejet-core-pack/webdriver';
 * const el = await findInputSensitiveText(driver, By.id('my-oj-c-input-sensitive-text'));
 * ```
 * @param driver A WebDriver/WebElement instance from where the element will be
 * searched. If WebDriver is passed, the element will be searched globally in the
 * document. If WebElement is passed, the search will be relative to this element.
 * @param by The locator with which to find the element
 */
async function findInputSensitiveText(driver, by) {
    const webEl = await driver.findElement(by);
    // Check that the element is of type InputSensitiveTextWebElement
    if (!(webEl instanceof InputSensitiveTextWebElement_1.InputSensitiveTextWebElement)) {
        const tagName = await webEl.getTagName();
        let supplemental = '';
        if (webEl.constructor.name === 'InputSensitiveTextWebElement') {
            supplemental = 'You likely have multiple installations of this package.';
        }
        throw Error(`findInputSensitiveText(${by}) created ${webEl.constructor.name} for <${tagName}>, but expected ${InputSensitiveTextWebElement_1.InputSensitiveTextWebElement.name}. ${supplemental}`);
    }
    return webEl;
}
exports.findInputSensitiveText = findInputSensitiveText;
(0, oraclejet_webdriver_1.register)('oj-c-input-sensitive-text', InputSensitiveTextWebElement_1.InputSensitiveTextWebElement);
//# sourceMappingURL=index.js.map