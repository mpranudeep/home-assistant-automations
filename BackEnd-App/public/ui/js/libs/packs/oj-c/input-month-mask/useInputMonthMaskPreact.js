define(["require", "exports", "oj-c/editable-value/UNSAFE_useEditableValueRawValueObject/useEditableValueRawValueObject", "./CalendarMonthConverter", "preact/hooks", "@oracle/oraclejet-preact/hooks/UNSAFE_useTranslationBundle", "ojs/ojconverter-preferences", "@oracle/oraclejet-preact/utils/UNSAFE_calendarDateUtils", "./useImplicitCalendarMonthRangeValidator", "oj-c/editable-value/utils/utils", "ojs/ojconfig"], function (require, exports, useEditableValueRawValueObject_1, CalendarMonthConverter_1, hooks_1, UNSAFE_useTranslationBundle_1, ojconverter_preferences_1, UNSAFE_calendarDateUtils_1, useImplicitCalendarMonthRangeValidator_1, utils_1, ojconfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useInputMonthMaskPreact = void 0;
    function useInputMonthMaskPreact({ dateRangeOverflowMessageDetail, dateRangeUnderflowMessageDetail, disabled, displayOptions, labelEdge, labelHint, labelStartWidth, max, messagesCustom, min, readonly, required, requiredMessageDetail, textAlign, userAssistanceDensity, validators, value: propValue, onMessagesCustomChanged, onRawValueChanged, onValidChanged, onValueChanged, ...otherProps }, addBusyState) {
        const minTreatNull = (0, utils_1.treatNull)(min);
        const maxTreatNull = (0, utils_1.treatNull)(max);
        const translations = (0, UNSAFE_useTranslationBundle_1.useTranslationBundle)('@oracle/oraclejet-preact');
        const calendarMonthConverter_parseErrorFn = translations.calendarMonthConverter_parseError;
        const masksFromUserPref = (0, hooks_1.useMemo)(() => {
            return getMasksFromDatePatternPreferences();
        }, []);
        const implicitConverter = (0, hooks_1.useMemo)(() => {
            return new CalendarMonthConverter_1.CalendarMonthConverter({
                calendarMonthConverter_parseErrorFn,
                customMask: masksFromUserPref
            });
        }, [calendarMonthConverter_parseErrorFn, masksFromUserPref]);
        const exampleFormatter = (0, hooks_1.useMemo)(() => {
            return {
                format: (value) => {
                    return (0, UNSAFE_calendarDateUtils_1.formatCalendarMonthRequiredAsExample)((0, ojconfig_1.getLocale)(), value, masksFromUserPref);
                }
            };
        }, [masksFromUserPref]);
        const implicitComponentValidator = (0, useImplicitCalendarMonthRangeValidator_1.useImplicitCalendarMonthRangeValidator)({
            formatObj: exampleFormatter,
            dateRangeOverflowMessageDetail,
            dateRangeUnderflowMessageDetail,
            max: maxTreatNull,
            min: minTreatNull
        });
        const { methods, textFieldProps, value, setValue } = (0, useEditableValueRawValueObject_1.useEditableValueRawValueObject)({
            ariaDescribedBy: otherProps['aria-describedby'],
            converter: implicitConverter,
            disabled,
            displayOptions,
            implicitComponentValidator,
            labelHint,
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
        const hasNoValue = value === undefined || !isPartialDate(textFieldProps.value);
        return {
            value,
            setValue,
            methods,
            inputMonthMaskProps: {
                isDisabled: disabled,
                isReadonly: readonly,
                isRequired: required,
                isRequiredShown: required && (userAssistanceDensity === 'compact' || hasNoValue),
                label: labelHint,
                labelEdge,
                labelStartWidth,
                masks: masksFromUserPref,
                textAlign,
                userAssistanceDensity,
                ...textFieldProps
            }
        };
    }
    exports.useInputMonthMaskPreact = useInputMonthMaskPreact;
    const isPartialDate = (value) => {
        if (value === undefined)
            return false;
        return value.year !== undefined || value.month !== undefined;
    };
    const getMasksFromDatePatternPreferences = () => {
        const prefs = (0, ojconverter_preferences_1.getDateTimePreferences)();
        const pattern = prefs.dateStyle?.short?.pattern;
        if (!pattern || pattern.toUpperCase().includes('MMM')) {
            return undefined;
        }
        const datePlaceholders = (0, UNSAFE_calendarDateUtils_1.getDatePlaceholdersFromPattern)(pattern);
        const monthDatePlaceholder = (0, UNSAFE_calendarDateUtils_1.getMonthYearPlaceholdersFromDatePlaceholders)(datePlaceholders);
        return monthDatePlaceholder;
    };
});
