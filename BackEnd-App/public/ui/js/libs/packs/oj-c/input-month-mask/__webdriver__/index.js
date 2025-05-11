"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findInputMonthMask = exports.InputMonthMaskWebElement = void 0;
var oraclejet_webdriver_1 = require("@oracle/oraclejet-webdriver");
var InputMonthMaskWebElement_1 = require("./InputMonthMaskWebElement");
Object.defineProperty(exports, "InputMonthMaskWebElement", { enumerable: true, get: function () { return InputMonthMaskWebElement_1.InputMonthMaskWebElement; } });
/**
 * Retrieve an instance of [InputMonthMaskWebElement](../classes/InputMonthMaskWebElement.html).
 * @example
 * ```javascript
 * import { findInputMonthMask } from '@oracle/oraclejet-core-pack/webdriver';
 * const el = await findInputMonthMask(driver, By.id('my-oj-c-input-month-mask'));
 * ```
 * @param driver A WebDriver/WebElement instance from where the element will be
 * searched. If WebDriver is passed, the element will be searched globally in the
 * document. If WebElement is passed, the search will be relative to this element.
 * @param by The locator with which to find the element
 */
async function findInputMonthMask(driver, by) {
    const webEl = await driver.findElement(by);
    // Check that the element is of type InputMonthMaskWebElement
    if (!(webEl instanceof InputMonthMaskWebElement_1.InputMonthMaskWebElement)) {
        const tagName = await webEl.getTagName();
        let supplemental = '';
        if (webEl.constructor.name === 'InputMonthMaskWebElement') {
            supplemental = 'You likely have multiple installations of this package.';
        }
        throw Error(`findInputMonthMask(${by}) created ${webEl.constructor.name} for <${tagName}>, but expected ${InputMonthMaskWebElement_1.InputMonthMaskWebElement.name}. ${supplemental}`);
    }
    return webEl;
}
exports.findInputMonthMask = findInputMonthMask;
(0, oraclejet_webdriver_1.register)('oj-c-input-month-mask', InputMonthMaskWebElement_1.InputMonthMaskWebElement);
//# sourceMappingURL=index.js.map