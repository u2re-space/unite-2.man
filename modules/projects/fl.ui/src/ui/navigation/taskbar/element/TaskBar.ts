/* Taskbar wrapper */
import UIElement from "@design/base/UIElement";
import { H, defineElement } from "fest/lure";

//
// @ts-ignore
import styles from "../scss/TaskBar.scss?inline";
import { preloadStyle } from "fest/dom";
const styled = preloadStyle(styles);

//
// @ts-ignore
@defineElement("ui-taskbar")
export class UITaskBar extends UIElement {
    constructor() {
        super();
    }

    //
    styles = () => styled?.cloneNode?.(true);
    render = function () { return H`<div part="taskbar" class="taskbar"><slot></slot></div>`; }
}
