import { property, defineElement, Q, H } from "fest/lure"
import { DOMMixin, preloadStyle } from "fest/dom"
import { ScrollBar } from "../scrollbar/ScrollBar"
import { UIElement } from "@design/base/UIElement"

// @ts-ignore
import styles from "./ScrollFrame.scss?inline"
const styled = preloadStyle(styles);

// @ts-ignore
@defineElement("ui-scrollframe")
export class ScrollBoxed extends UIElement {
    @property({source: "attr"}) anchor = "_";
    #x: any = null;
    #y: any = null;

    //
    constructor() { super(); }
    onInitialize() { //@ts-ignore
        super.onInitialize?.(); //@ts-ignore
    }

    //
    bindWith(content: any, inputChange?: any|null) {
        requestAnimationFrame(()=>{ // @ts-ignore
            this.#x = new ScrollBar({holder: this, scrollbar: Q(".ui-scrollbar[axis=\"x\"]", this.shadowRoot), content, inputChange}, 0); // @ts-ignore
            this.#y = new ScrollBar({holder: this, scrollbar: Q(".ui-scrollbar[axis=\"y\"]", this.shadowRoot), content, inputChange}, 1); // @ts-ignore
        });
        const name = "--rand-" + Math.random().toString(36).slice(2); // @ts-ignore
        this.style.positionAnchor = name, content.style.anchorName = name;
    }

    //
    styles = () => styled?.cloneNode?.(true);
    render = () => H`
<slot></slot>
<div class="ui-scrollbar" axis="x"><div class="ui-thumb"></div></div>
<div class="ui-scrollbar" axis="y"><div class="ui-thumb"></div></div>`;
}

//
export class OverlayScrollbarMixin extends DOMMixin {
    constructor(name?) { super(name); }

    // @ts-ignore
    connect(ws) {
        const self: any = ws?.deref?.();
        const frame = document.createElement("ui-scrollframe"); // @ts-ignore
        frame?.bindWith?.(self);

        //
        self.style.scrollbarGutter = "auto";
        self.style.scrollbarWidth = "none";
        self.style.scrollbarColor = "transparent transparent";
        self.style.overflow = "scroll";
        self.style.zIndex = (Number(getComputedStyle(self)?.zIndex || 0) + 1) + "";

        //
        self.parentNode?.append(frame);
    }
}

//
new OverlayScrollbarMixin("ov-scrollbar");
export default ScrollBoxed;
