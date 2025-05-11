import { JetElement, JetSettableProperties, JetElementCustomEventStrict, JetSetPropertyType } from 'ojs/index';
import { GlobalProps } from 'ojs/ojvcomponent';
import 'ojs/oj-jsx-interfaces';
import { SplitMenuButton as PreactSplitMenuButton } from '@oracle/oraclejet-preact/UNSAFE_SplitMenuButton';
import { ComponentProps, Component } from 'preact';
import { ExtendGlobalProps, Action, Bubbles, ObservedGlobalProps } from 'ojs/ojvcomponent';
import 'css!oj-c/split-menu-button/split-menu-button-styles.css';
import { Size } from '@oracle/oraclejet-preact/utils/UNSAFE_size';
export type { MenuValueUpdateDetail } from '@oracle/oraclejet-preact/UNSAFE_Menu/menuUtils';
import { MenuItemSelectionDetail, MenuItem, MenuSeparator } from '../utils/PRIVATE_ItemsMenu/items-menu';
export type { MenuSelection, MenuItemSelectionDetail } from '../utils/PRIVATE_ItemsMenu/items-menu';
export type MenuItems = MenuItem | MenuSeparator;
type PreactSplitMenuButtonProps = ComponentProps<typeof PreactSplitMenuButton>;
type Props = ObservedGlobalProps<'aria-describedby'> & {
    label: string;
    items?: MenuItems[];
    onOjMenuAction?: Action<MenuItemSelectionDetail> & Bubbles;
    tooltip?: string;
    disabled?: boolean;
    size?: PreactSplitMenuButtonProps['size'];
    width?: Size;
    chroming?: PreactSplitMenuButtonProps['variant'];
    onOjAction?: Action & Bubbles;
};
export declare class SplitMenuButton extends Component<ExtendGlobalProps<Props>> {
    static defaultProps: Partial<Props>;
    private buttonRef;
    render(props: ExtendGlobalProps<Props>): import("preact").JSX.Element;
    blur(): void;
    focus(): void;
    doAction(): void;
}
export interface CSplitMenuButtonElement extends JetElement<CSplitMenuButtonElementSettableProperties>, CSplitMenuButtonElementSettableProperties {
    addEventListener<T extends keyof CSplitMenuButtonElementEventMap>(type: T, listener: (this: HTMLElement, ev: CSplitMenuButtonElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CSplitMenuButtonElementSettableProperties>(property: T): CSplitMenuButtonElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CSplitMenuButtonElementSettableProperties>(property: T, value: CSplitMenuButtonElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CSplitMenuButtonElementSettableProperties>): void;
    setProperties(properties: CSplitMenuButtonElementSettablePropertiesLenient): void;
    blur: SplitMenuButton['blur'];
    doAction: SplitMenuButton['doAction'];
    focus: SplitMenuButton['focus'];
}
export namespace CSplitMenuButtonElement {
    interface ojMenuAction extends CustomEvent<{
        key: string;
    }> {
    }
    interface ojAction extends CustomEvent<{}> {
    }
    type chromingChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['chroming']>;
    type disabledChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['disabled']>;
    type itemsChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['items']>;
    type labelChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['label']>;
    type sizeChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['size']>;
    type tooltipChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['tooltip']>;
    type widthChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['width']>;
}
export interface CSplitMenuButtonElementEventMap extends HTMLElementEventMap {
    'ojMenuAction': CSplitMenuButtonElement.ojMenuAction;
    'ojAction': CSplitMenuButtonElement.ojAction;
    'chromingChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['chroming']>;
    'disabledChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['disabled']>;
    'itemsChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['items']>;
    'labelChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['label']>;
    'sizeChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['size']>;
    'tooltipChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['tooltip']>;
    'widthChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['width']>;
}
export interface CSplitMenuButtonElementSettableProperties extends JetSettableProperties {
    chroming?: Props['chroming'];
    disabled?: Props['disabled'];
    items?: Props['items'];
    label: Props['label'];
    size?: Props['size'];
    tooltip?: Props['tooltip'];
    width?: Props['width'];
}
export interface CSplitMenuButtonElementSettablePropertiesLenient extends Partial<CSplitMenuButtonElementSettableProperties> {
    [key: string]: any;
}
export interface SplitMenuButtonIntrinsicProps extends Partial<Readonly<CSplitMenuButtonElementSettableProperties>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    onojAction?: (value: CSplitMenuButtonElementEventMap['ojAction']) => void;
    onojMenuAction?: (value: CSplitMenuButtonElementEventMap['ojMenuAction']) => void;
    onchromingChanged?: (value: CSplitMenuButtonElementEventMap['chromingChanged']) => void;
    ondisabledChanged?: (value: CSplitMenuButtonElementEventMap['disabledChanged']) => void;
    onitemsChanged?: (value: CSplitMenuButtonElementEventMap['itemsChanged']) => void;
    onlabelChanged?: (value: CSplitMenuButtonElementEventMap['labelChanged']) => void;
    onsizeChanged?: (value: CSplitMenuButtonElementEventMap['sizeChanged']) => void;
    ontooltipChanged?: (value: CSplitMenuButtonElementEventMap['tooltipChanged']) => void;
    onwidthChanged?: (value: CSplitMenuButtonElementEventMap['widthChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-split-menu-button': SplitMenuButtonIntrinsicProps;
        }
    }
}
