define(["require", "exports", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue", "oj-c/editable-value/utils/utils"], function (require, exports, useEditableValue_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useInputSensitiveTextPreact = void 0;
    function useInputSensitiveTextPreact({ autofocus, clearIcon = 'never', disabled, displayOptions, labelEdge, labelHint, labelStartWidth, length, maskIcon, maskIconLabel, messagesCustom, placeholder, readonly, required, requiredMessageDetail, textAlign, userAssistanceDensity, validators, value: propValue, virtualKeyboard, onMessagesCustomChanged, onRawValueChanged, onValidChanged, onValueChanged, ...otherProps }, addBusyState) {
        const { methods, textFieldProps, value, setValue } = (0, useEditableValue_1.useEditableValue)({
            ariaDescribedBy: otherProps['aria-describedby'],
            disabled,
            displayOptions,
            messagesCustom,
            readonly,
            required,
            requiredMessageDetail,
            validators,
            value: propValue,
            addBusyState,
            onMessagesCustomChanged,
            onRawValueChanged,
            onValidChanged,
            onValueChanged
        });
        const hasNoValue = value === null || (typeof value === 'string' && value === '');
        const hasClearIcon = clearIcon === 'conditional' ? 'conditionally' : clearIcon;
        const hasRevealToggle = maskIcon === 'hidden' ? 'never' : 'always';
        return {
            value,
            setValue,
            methods,
            inputSensitiveTextProps: {
                ...textFieldProps,
                autoFocus: autofocus,
                hasClearIcon,
                hasRevealToggle,
                isDisabled: disabled,
                isReadonly: readonly,
                isRequired: required,
                isRequiredShown: required && (userAssistanceDensity === 'compact' || hasNoValue),
                label: labelHint,
                labelEdge,
                labelStartWidth,
                maxLength: (0, utils_1.treatNull)(length?.max),
                maxLengthUnit: length?.countBy,
                placeholder,
                revealToggleLabel: maskIconLabel,
                textAlign,
                userAssistanceDensity,
                virtualKeyboard
            }
        };
    }
    exports.useInputSensitiveTextPreact = useInputSensitiveTextPreact;
});
