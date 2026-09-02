# Task 5 brief

## Prior facts
- appear/disappear/waitElementAnimations/dispatchLifecycleEvent live in @fest-lib/style-lib (modules/projects/style.ts/src/lifecycle.ts)
- Copy lur.e/scripts/run-mapped-tests.mjs → run-mapped-lifecycle-tests.mjs with new entry/outDir
- Copy JSDOM prelude from test/mapped.node.test.ts
- Do not git commit. Do not edit */fest. Do not run full `npm test` in lure — only test:mapped-lifecycle.
- Existing sync callers may ignore the Promise; detach must still happen.
- Style-lib alias already in run-mapped-tests.mjs.

### Task 5: LUR.E `appendChild` / `removeChild` wait

**Files:**
- Modify: `modules/projects/lur.e/src/lure/context/Utils.ts`
- Modify: `modules/projects/lur.e/src/lure/context/ReflectChildren.ts`

**Interfaces:**
- Consumes: `appear`, `disappear`, `waitElementAnimations`, `dispatchLifecycleEvent` from `@fest-lib/style-lib`
- Produces:
  - `export type NodeLifecycle = { appear?: AnimationOptions | null; disappear?: AnimationOptions | null }`
  - `appendChild(element, cp, mapper?, index?, lifecycle?: NodeLifecycle): Promise<any>`
  - `removeChild(element, cp, mapper?, index?, lifecycle?: NodeLifecycle): Promise<any>`
  - `removeNotExists(..., lifecycle?: NodeLifecycle): Promise<any>`
  - `makeUpdater(parent, mapper?, isArray?, lifecycle?: NodeLifecycle)` — `merge` awaits each command

- [ ] **Step 1: Write the failing test**

Create `modules/projects/lur.e/test/mapped-lifecycle.node.test.ts` using the same JSDOM prelude as `mapped.node.test.ts` (copy the global install block). Then:

```ts
const { removeChild, appendChild } = await import("../src/lure/context/Utils");

const tick = () => new Promise((r) => setTimeout(r, 5));

test("removeChild without lifecycle detaches immediately", async () => {
    const parent = document.createElement("div");
    const child = document.createElement("span");
    parent.append(child);
    await removeChild(parent, child);
    assert.equal(child.parentNode, null);
});

test("removeChild sets data-removing and waits getAnimations", async () => {
    const parent = document.createElement("div");
    const child = document.createElement("span");
    parent.append(child);
    let finished!: () => void;
    const done = new Promise<void>((resolve) => { finished = resolve; });
    child.getAnimations = () => [{ playState: "running", finished: done }];
    const pending = removeChild(parent, child);
    await tick();
    assert.equal(child.getAttribute("data-removing"), "");
    assert.equal(child.parentNode, parent);
    finished();
    await pending;
    assert.equal(child.parentNode, null);
});

test("cancel u2-before-remove leaves the node", async () => {
    const parent = document.createElement("div");
    const child = document.createElement("span");
    parent.append(child);
    child.addEventListener("u2-before-remove", (ev) => ev.preventDefault());
    await removeChild(parent, child);
    assert.equal(child.parentNode, parent);
});
```

Create `modules/projects/lur.e/scripts/run-mapped-lifecycle-tests.mjs` by copying `run-mapped-tests.mjs` and changing `entry` / `outDir` / `fileName` to `mapped-lifecycle`.

Add lure script: `"test:mapped-lifecycle": "node ./scripts/run-mapped-lifecycle-tests.mjs"`

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/lur.e && npm run test:mapped-lifecycle
```

Expected: FAIL (`removeChild` is sync and ignores `data-removing` / cancel).

- [ ] **Step 3: Write minimal implementation**

In `Utils.ts`:

```ts
import { appear, disappear, dispatchLifecycleEvent, waitElementAnimations } from "@fest-lib/style-lib";
import type { AnimationOptions } from "@fest-lib/style-lib";

export type NodeLifecycle = {
    appear?: AnimationOptions | null;
    disappear?: AnimationOptions | null;
};

export const appendChild = async (element, cp, mapper?: Function | null, index: number = -1, lifecycle?: NodeLifecycle) => {
    // keep existing mapper / appendArray body, then:
    // after the node is in the tree:
    const node = /* the appended Element, if any */;
    if (node instanceof Element) {
        await appear(node, lifecycle?.appear ?? null);
    }
    return element;
};

export const removeChild = async (element, cp, mapper?: Function | null, index: number = -1, lifecycle?: NodeLifecycle) => {
    const $node = getNode(cp, mapper);
    if (!element) element = $node?.parentNode;
    if (Array.from(element?.childNodes ?? []).length < 1) return element;
    const whatToRemove = dePhantomNode(element, $node, index);
    if (whatToRemove?.parentNode != element) return element;
    if (whatToRemove instanceof Element) {
        if (!dispatchLifecycleEvent(whatToRemove, "u2-before-remove")) return element;
        whatToRemove.setAttribute("data-removing", "");
        await disappear(whatToRemove, lifecycle?.disappear ?? null);
        await waitElementAnimations(whatToRemove);
        whatToRemove.remove();
        whatToRemove.removeAttribute("data-removing");
        dispatchLifecycleEvent(whatToRemove, "u2-removed");
        return element;
    }
    whatToRemove?.remove?.();
    return element;
};
```

Keep the existing `appendArray` / fragment logic; only await `appear` on real Elements after `appendFix`.

`removeNotExists` must `await Promise.all` of `removeChild` for missing nodes.

In `ReflectChildren.ts` `makeUpdater`:

```ts
export const makeUpdater = (defaultParent: Node | null = null, mapper?: Function | null, isArray: boolean = true, lifecycle?: NodeLifecycle) => {
    const commandBuffer: any[] = [];
    const merge = async () => {
        const batch = commandBuffer.splice(0, commandBuffer.length);
        for (const [fn, args] of batch) await fn?.(...args, lifecycle);
    };
    // push [removeChild, [element, oldNode, null, oldIdx]] as today
    // if op requires merge, return merge() (Promise)
};
```

Callers of `makeUpdater` that ignore the return value stay valid; the detach still happens.

- [ ] **Step 4: Run the tests and make sure they pass**

`npm run test:mapped-lifecycle` — PASS for the three Utils tests (Mapped tests in Task 6).

- [ ] **Step 5: Commit**

Skip unless the user asked to commit.

---

