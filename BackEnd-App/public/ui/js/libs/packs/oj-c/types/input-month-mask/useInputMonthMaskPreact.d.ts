import { ComponentProps } from 'preact';
import type { CalendarMonth } from '@oracle/oraclejet-preact/UNSAFE_InputDateMask';
import type { InputMonthMask } from 'oj-c/input-month-mask';
type InputMonthMaskProps = ComponentProps<typeof InputMonthMask>;
export declare function useInputMonthMaskPreact({ dateRangeOverflowMessageDetail, dateRangeUnderflowMessageDetail, disabled, displayOptions, labelEdge, labelHint, labelStartWidth, max, messagesCustom, min, readonly, required, requiredMessageDetail, textAlign, userAssistanceDensity, validators, value: propValue, onMessagesCustomChanged, onRawValueChanged, onValidChanged, onValueChanged, ...otherProps }: InputMonthMaskProps, addBusyState?: (desc?: string) => () => void): {
    value: Required<CalendarMonth> | undefined;
    setValue: import("preact/hooks").StateUpdater<Required<CalendarMonth> | undefined>;
    methods: {
        reset: () => void;
        validate: () => Promise<"invalid" | "valid">;
        showMessages: () => void;
    };
    inputMonthMaskProps: Omit<import("@oracle/oraclejet-preact/hooks/UNSAFE_useTestId").TestIdProps & {
        'aria-describedby'?: string | undefined;
        assistiveText?: string | undefined;
        columnSpan?: import("@oracle/oraclejet-preact/utils/UNSAFE_styles/Layout").LayoutColumns | undefined;
        granularity?: "day" | "month" | undefined;
        helpSourceLink?: string | undefined;
        helpSourceText?: string | undefined;
        isDisabled?: boolean | undefined;
        isReadonly?: boolean | undefined;
        isRequired?: boolean | undefined;
        isRequiredShown?: boolean | undefined;
        label: string;
        labelEdge?: "none" | "start" | "top" | "inside" | undefined;
        labelStartWidth?: import("@oracle/oraclejet-preact/utils/UNSAFE_size").Size | undefined;
        masks?: import("@oracle/oraclejet-preact/UNSAFE_InputDateMask").DatePlaceholders | undefined;
        messages?: import("@oracle/oraclejet-preact/UNSAFE_ComponentMessage").ComponentMessageItem[] | undefined;
        textAlign?: "end" | "start" | "right" | undefined;
        userAssistanceDensity?: import("@oracle/oraclejet-preact/UNSAFE_UserAssistance").UserAssistanceDensityType | undefined;
        value?: import("@oracle/oraclejet-preact/UNSAFE_InputDateMask").CalendarDate | undefined;
        variant?: "default" | "embedded" | undefined;
        onCommit?: ((detail: import("@oracle/oraclejet-preact/utils/UNSAFE_valueUpdateDetail").ValueUpdateDetail<import("@oracle/oraclejet-preact/UNSAFE_InputDateMask").CalendarDate>) => void) | undefined;
        onInput: (detail: import("@oracle/oraclejet-preact/utils/UNSAFE_valueUpdateDetail").ValueUpdateDetail<import("@oracle/oraclejet-preact/UNSAFE_InputDateMask").CalendarDate>) => void;
    }, "ref"> & {
        ref?: import("preact").Ref<import("@oracle/oraclejet-preact/hooks/UNSAFE_useFocusableTextField").FocusableHandle> | undefined;
    };
};
export {};
