var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_SplitMenuButton", "@oracle/oraclejet-preact/hooks/UNSAFE_useTooltip", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "@oracle/oraclejet-preact/utils/UNSAFE_mergeProps", "preact", "preact/hooks", "preact/compat", "ojs/ojvcomponent", "../utils/PRIVATE_ItemsMenu/items-menu", "css!oj-c/split-menu-button/split-menu-button-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_SplitMenuButton_1, UNSAFE_useTooltip_1, UNSAFE_useTabbableMode_1, UNSAFE_mergeProps_1, preact_1, hooks_1, compat_1, ojvcomponent_1, items_menu_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SplitMenuButton = void 0;
    let SplitMenuButton = class SplitMenuButton extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.buttonRef = (0, preact_1.createRef)();
        }
        render(props) {
            const { chroming, label, disabled, size, items, tooltip, onOjMenuAction, 'aria-describedby': ariaDescribedBy, onOjAction: onAction } = { ...props };
            const widthSize = props.width ? { width: props.width } : {};
            return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, { style: widthSize, children: (0, jsx_runtime_1.jsx)(FunctionalSplitMenuButton, { tooltip: tooltip, label: label, ref: this.buttonRef, variant: chroming, size: size, width: '100%', "aria-describedby": ariaDescribedBy, isDisabled: disabled, onAction: onAction, children: (0, jsx_runtime_1.jsx)(items_menu_1.ItemsMenu, { isSplitMenu: true, items: items, onOjMenuAction: onOjMenuAction }) }) }));
        }
        blur() {
            this.buttonRef.current?.blur();
        }
        focus() {
            this.buttonRef.current?.focus();
        }
        doAction() {
            this.buttonRef.current?.doAction();
        }
    };
    exports.SplitMenuButton = SplitMenuButton;
    SplitMenuButton.defaultProps = {
        label: '',
        chroming: 'outlined',
        disabled: false,
        size: 'md',
        items: []
    };
    SplitMenuButton._metadata = { "properties": { "label": { "type": "string" }, "items": { "type": "Array<object>" }, "tooltip": { "type": "string" }, "disabled": { "type": "boolean" }, "size": { "type": "string", "enumValues": ["sm", "md", "lg"] }, "width": { "type": "number|string" }, "chroming": { "type": "string", "enumValues": ["solid", "outlined", "callToAction"] } }, "events": { "ojMenuAction": { "bubbles": true }, "ojAction": { "bubbles": true } }, "extension": { "_OBSERVED_GLOBAL_PROPS": ["aria-describedby"] }, "methods": { "blur": {}, "focus": {}, "doAction": {} } };
    SplitMenuButton._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    SplitMenuButton._consumedContexts = [UNSAFE_useTabbableMode_1.TabbableModeContext];
    exports.SplitMenuButton = SplitMenuButton = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-split-menu-button')
    ], SplitMenuButton);
    const FunctionalSplitMenuButton = (0, compat_1.forwardRef)((props, ref) => {
        const buttonRef = (0, hooks_1.useRef)(null);
        (0, hooks_1.useImperativeHandle)(ref, () => ({
            focus: () => buttonRef.current?.focus(),
            blur: () => buttonRef.current?.blur(),
            doAction: () => buttonRef.current?.dispatchEvent(new Event('ojAction', { bubbles: true }))
        }), []);
        const { tooltipContent, tooltipProps } = (0, UNSAFE_useTooltip_1.useTooltip)({
            text: props.tooltip,
            isDisabled: props.isDisabled
        });
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(UNSAFE_SplitMenuButton_1.SplitMenuButton, { ref: buttonRef, ...(0, UNSAFE_mergeProps_1.mergeProps)(props, tooltipProps) }), tooltipContent] }));
    });
});
