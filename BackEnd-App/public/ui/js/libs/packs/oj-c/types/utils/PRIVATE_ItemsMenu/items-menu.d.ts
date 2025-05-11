import { MenuItems, MenuSelection, MenuItemSelectionDetail } from './menuTypes';
export { MenuItem, MenuItems, MenuSeparator, MenuSelection, MenuItemSelectionDetail, MenuIcon, MenuSelectItem } from './menuTypes';
type Props = {
    items?: MenuItems[];
    selection?: Readonly<Record<string, MenuSelection>>;
    onSelectionChanged?: (value: Readonly<Record<string, MenuSelection>>) => void;
    onOjMenuAction?: (details: MenuItemSelectionDetail) => void;
    isSplitMenu?: boolean;
};
export declare const ItemsMenu: ({ items, selection, onSelectionChanged, onOjMenuAction, isSplitMenu }: Props) => import("preact").JSX.Element;
