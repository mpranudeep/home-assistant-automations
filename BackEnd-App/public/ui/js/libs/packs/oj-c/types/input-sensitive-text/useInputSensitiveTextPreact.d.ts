import type { InputSensitiveTextProps } from './input-sensitive-text';
export declare function useInputSensitiveTextPreact<V extends string = string>({ autofocus, clearIcon, disabled, displayOptions, labelEdge, labelHint, labelStartWidth, length, maskIcon, maskIconLabel, messagesCustom, placeholder, readonly, required, requiredMessageDetail, textAlign, userAssistanceDensity, validators, value: propValue, virtualKeyboard, onMessagesCustomChanged, onRawValueChanged, onValidChanged, onValueChanged, ...otherProps }: InputSensitiveTextProps<V>, addBusyState?: (desc?: string) => () => void): {
    value: V;
    setValue: import("preact/hooks").StateUpdater<V>;
    methods: {
        reset: () => void;
        validate: () => Promise<"invalid" | "valid">;
        showMessages: () => void;
    };
    inputSensitiveTextProps: Omit<{
        'aria-describedby'?: string | undefined;
        assistiveText?: string | undefined;
        autoFocus?: boolean | undefined;
        columnSpan?: import("@oracle/oraclejet-preact/utils/UNSAFE_styles/Layout").LayoutColumns | undefined;
        hasClearIcon?: "always" | "never" | "conditionally" | undefined;
        hasRevealToggle?: "always" | "never" | undefined;
        helpSourceLink?: string | undefined;
        helpSourceText?: string | undefined;
        isDisabled?: boolean | undefined;
        isReadonly?: boolean | undefined;
        isRequired?: boolean | undefined;
        isRequiredShown?: boolean | undefined;
        label: string;
        labelEdge?: "none" | "start" | "top" | "inside" | undefined;
        labelStartWidth?: import("@oracle/oraclejet-preact/utils/UNSAFE_size").Size | undefined;
        maxLength?: number | undefined;
        maxLengthUnit?: import("@oracle/oraclejet-preact/utils/UNSAFE_lengthFilter").CountUnit | undefined;
        messages?: import("@oracle/oraclejet-preact/UNSAFE_ComponentMessage").ComponentMessageItem[] | undefined;
        placeholder?: string | undefined;
        revealToggleLabel?: string | undefined;
        textAlign?: "end" | "start" | "right" | undefined;
        userAssistanceDensity?: import("@oracle/oraclejet-preact/UNSAFE_UserAssistance").UserAssistanceDensityType | undefined;
        value?: string | undefined;
        variant?: "default" | "embedded" | undefined;
        virtualKeyboard?: "number" | "search" | "auto" | "url" | "text" | "email" | "tel" | undefined;
        onCommit?: ((detail: import("@oracle/oraclejet-preact/utils/UNSAFE_valueUpdateDetail").ValueUpdateDetail<string>) => void) | undefined;
        onInput: ((detail: import("@oracle/oraclejet-preact/utils/UNSAFE_valueUpdateDetail").ValueUpdateDetail<string>) => void) | undefined;
    } & import("@oracle/oraclejet-preact/hooks/UNSAFE_useTestId").TestIdProps, "ref"> & {
        ref?: import("preact").Ref<import("@oracle/oraclejet-preact/hooks/UNSAFE_useFocusableTextField").FocusableHandle> | undefined;
    };
};
