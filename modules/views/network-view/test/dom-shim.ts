/**
 * Test-only DOM shim — installs jsdom globals for Network a11y contract tests.
 */
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    pretendToBeVisual: true,
    url: "http://localhost/"
});

const g = globalThis as unknown as {
    document?: unknown;
    window?: unknown;
    HTMLElement?: unknown;
    Node?: unknown;
    Element?: unknown;
    HTMLButtonElement?: unknown;
};

g.document = dom.window.document;
g.window = dom.window;
g.HTMLElement = dom.window.HTMLElement;
g.Node = dom.window.Node;
g.Element = dom.window.Element;
g.HTMLButtonElement = dom.window.HTMLButtonElement;

export {};
