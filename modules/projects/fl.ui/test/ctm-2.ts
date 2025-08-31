import { H, M } from "fest/lure";
import "fest/fl-ui";

//
const tonesShift = [0, 0.025, 0.05, 0.075, 0.1, 0.125, 0.15, 0.175, 0.2];

//
const makeDecorativeBlocks = (className)=> {
    return H`
        <div class="color-row">
            ${M(tonesShift, (tone) => H`<div class="color-block" classList=${[className]} style=${{
                "--background-tone-shift": `${tone}`
            }}>
            <span class="text-test">A</span>
            <span class="tone-label">${tone}</span>
            </div>
        `)?.element}</div>`;
};

//
const testTestTone = (name: string)=>H`
    <div class="color-section">
        <div style="background-color: transparent;" class="theme-section light">
            <div class="color-title">Light Version (${name})</div>
            ${makeDecorativeBlocks(name)}
        </div>
        <div style="background-color: transparent;" class="theme-section dark">
            <div class="color-title">Dark Version (${name})</div>
            ${makeDecorativeBlocks(name)}
        </div>
    </div>
`;

//
document.body.append(testTestTone("c2-surface"));
document.body.append(testTestTone("c2-contrast"));
