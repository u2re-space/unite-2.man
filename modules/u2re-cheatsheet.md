# U2RE Cheat-Sheet for AI

---

## LUR.E

ModuleName: `fest/lure`

### Core Binding API

- `bindWith(element, propName, valueOrRef, handler, valueSet, ...others)`
    - `element`    - target HTML DOM Element
    - `propName`   - target property name
    - `valueOrRef` - value or ref, which reflects to target by `handler`
    - `handler`    - handler function `(element, propName, value)`
    - `valueSet`   - set, which contains value

- `bindBeh(element, store, behavior)`
    - `element` - target HTML DOM Element
    - `store` - reactive store `[name, object]`
    - `behavior` - behavior function `(event, context)`

- `bindCtrl(element, ctrlCb)`
    - `element` - target HTML DOM Element
    - `ctrlCb` - controller callback function
    - Returns cancel function

- `reflectControllers(element, ctrls)`
    - `element` - target HTML DOM Element
    - `ctrls` - array of controller functions

- `bindEvents(element, events)`
    - `element` - target HTML DOM Element
    - `events` - object with event handlers

- `bindForms(fields, wrapper, state)`
    - `fields` - form fields container (default: `document.documentElement`)
    - `wrapper` - wrapper selector (default: `.u2-input`)
    - `state` - state object for form data

### Element Creation & Querying

- `E(selectorOrSelector, params, children)` - creates element by selector or use exists
    - `params` structured set
    - `children` array or mapper of potential nodes

- `Q(selector, host, direction)` - query based DOM element wrapper
    - `host`      - defaultly `document.documentElement`, host where from uses selection
    - `selector`  - string or DOM element
    - `direction` - default `"children"`, allows `"children"` or `"parent"`

- `Qp(ref, host)` - reactive query wrapper
    - `ref` - reactive reference to selector
    - `host` - host element (default: `document.documentElement`)

### Template & HTML Processing

- `H(HTMLCode)` or `H` prefix string literals, second allows creates reactive structures
- `html(strings, ...values)` - HTML template literal processor
- `htmlBuilder({ createElement })` - creates HTML builder with custom element creation

### Mapping & Iteration

- `M(array, mapper)`
    - `mapper(arg, index)` - callback, used for transform arguments

- `I(params)` - interactive/reactive iterator
    - `params.current` - reactive index `{ value: number }`
    - `params.mapped` - array of mapped elements

### Reactive References

- `makeRef(type, link, ...args)` - creates reactive reference with link
- `makeWeakRef(initial, behavior)` - creates weak reactive reference

#### Link Functions

- `localStorageLink(exists, key, initial)` - localStorage two-way binding
- `matchMediaLink(exists, condition)` - matchMedia boolean binding
- `visibleLink(exists, element, initial)` - element visibility binding
- `attrLink(exists, element, attribute, initial)` - attribute two-way binding
- `sizeLink(exists, element, axis, box)` - element size binding
- `scrollLink(exists, element, axis, initial)` - scroll offset binding
- `checkedLink(exists, element)` - checkbox checked state binding
- `valueLink(exists, element)` - input value binding
- `valueAsNumberLink(exists, element)` - input value as number binding
- `observeSizeLink(exists, element, box, styles)` - observed size with styles
- `orientLink(exists)` - orientation binding

#### Reference Creators

- `orientRef(...args)` - orientation reference
- `attrRef(...args)` - attribute reference
- `valueRef(...args)` - value reference
- `valueAsNumberRef(...args)` - value as number reference
- `localStorageRef(...args)` - localStorage reference
- `sizeRef(...args)` - size reference
- `checkedRef(...args)` - checked reference
- `scrollRef(...args)` - scroll reference
- `visibleRef(...args)` - visible reference
- `matchMediaRef(...args)` - matchMedia reference

### Controllers

- `checkboxCtrl(ref)` - checkbox controller
- `numberCtrl(ref)` - number input controller
- `valueCtrl(ref)` - value input controller
- `radioCtrl(ref, name)` - radio group controller
- `OOBTrigger(element, ref, selector)` - out-of-bounds trigger

### Utility Functions

- `includeSelf(target, selector)` - includes self in query results
- `updateInput(target, state)` - updates input with state
- `removeFromBank(el, handler, prop)` - removes from binding bank
- `addToBank(el, handler, prop, forLink)` - adds to binding bank
- `hasInBank(el, handle)` - checks if in binding bank

### Element Utilities

- `createElement(selector)` - creates element from CSS-like selector
- `getNode(E, mapper, index)` - gets DOM node for any value
- `appendChild(element, cp, mapper)` - appends child with mapping
- `replaceChildren(element, cp, mapper, index)` - replaces children
- `removeChild(element, cp, mapper, index)` - removes child
- `removeNotExists(element, children, mapper)` - removes non-existent children
- `T(ref)` - creates text node from reference

### Reflection Functions

- `reflectAttributes(element, attributes)` - reflects attributes
- `reflectARIA(element, aria)` - reflects ARIA attributes
- `reflectDataset(element, dataset)` - reflects dataset
- `reflectStyles(element, styles)` - reflects styles
- `reflectProperties(element, properties)` - reflects properties
- `reflectClassList(element, classList)` - reflects class list
- `reflectBehaviors(element, behaviors)` - reflects behaviors
- `reflectStores(element, stores)` - reflects stores
- `reflectMixins(element, mixins)` - reflects mixins
- `reflectChildren(element, children, mapper)` - reflects children
- `reformChildren(element, children, mapper)` - reforms children structure

### Style System

- `S(strings, ...values)` - reactive style template
- `css(strings, ...values)` - CSS template alias

### GLit Extension

- `GLitElement(derivative)` - creates GLit element class
- `withProperties(ctor)` - adds properties to constructor
- `defineElement(name, options)` - defines custom element
- `property({attribute, source, name, from})` - defines property
- `generateName(length)` - generates random name
- `loadCachedStyles(bTo, src)` - loads cached styles

### OPFS Extension

- `getDir(dest)` - gets directory path
- `openDirectory(rootHandle, relPath, options, logger)` - opens directory
- `readFile(rootHandle, relPath, options, logger)` - reads file
- `readAsObjectURL(rootHandle, relPath, options, logger)` - reads file as object URL
- `readFileUTF8(rootHandle, relPath, options, logger)` - reads file as UTF8
- `writeFile(rootHandle, relPath, { data }, logger)` - writes file
- `getFileWriter(rootHandle, relPath, options, logger)` - gets file writer
- `getFileHandle(rootHandle, relPath, options, logger)` - gets file handle
- `getHandler(rootHandle, relPath, options, logger)` - gets file handler
- `createHandler(rootHandle, relPath, options, logger)` - creates file handler
- `removeFile(rootHandle, relPath, options, logger)` - removes file
- `removeDirectory(rootHandle, relPath, options, logger)` - removes directory
- `remove(rootHandle, relPath, options, logger)` - removes file/directory
- `openImageFilePicker()` - opens image file picker
- `downloadFile(file)` - downloads file
- `provide(req, rw)` - provides file access
- `getLeast(item)` - gets least item
- `dropFile(file, dest, current)` - handles file drop
- `uploadFile(dest, current)` - handles file upload
- `attachFile(transfer, file, path)` - attaches file to transfer
- `dropAsTempFile(data)` - drops data as temp file

### Shortcuts

- `E(selectorOrSelector, params, children)` - creates element by selector or use exists
    - `params` structured set
    - `children` array or mapper of potential nodes
- `H(HTMLCode)` or `H` prefix string literals, second allows creates reactive structures
- `M(array, mapper)`
    - `mapper(arg, index)` - callback, used for transform arguments
- `Q(selector, host, direction)` - query based DOM element wrapper
    - `host`      - defaultly `document.documentElement`, host where from uses selection
    - `selector`  - string or DOM element
    - `direction` - default `"children"`, allows `"children"` or `"parent"`

### Additions

```
interface Params {
    classList?: Set<string>;
    attributes?: any;
    dataset?: any;
    properties?: any;
    behaviors?: any;
    stores?: any[] | Set<any> | Map<any, any>;
    style?: any | string;
    slot?: any | string;
    name?: any | string;
    type?: any | string;
    icon?: any | string;
    role?: any | string;
    inert?: boolean | string;
    mixins?: any;
    ctrls?: any;
    is?: any | string;
    part?: any | string;
    on?: any;
    hidden?: any;
    aria?: any;
    rules?: any[];
};
```

---

## DOM.ts

ModuleName: `fest/dom`

### Initialization

- `initialize(ROOT = document.body)` - initializes DOM.ts module
    - Sets up viewport tracking, visibility system, and styles
    - Returns style element

### Handlers

- `handleAttribute(element, propName, value)` - handles HTML attributes
- `handleStyleChange(element, propName, value)` - handles CSS style properties
- `handleDataset(element, propName, value)` - handles data-* attributes
- `handleProperty(element, propName, value)` - handles element properties
- `handleHidden(element, propName, visible)` - handles visibility state

### Viewport & Screen Management

- `getAvailSize()` - gets available screen dimensions
- `updateVP()` - updates viewport CSS custom properties
- `whenAnyScreenChanges(callback)` - listens to all screen changes
- `fixOrientToScreen(element)` - fixes element orientation to screen
- `getCorrectOrientation()` - gets current screen orientation

### Event Management

- `addEvent(target, type, callback, options)` - adds event listener
- `removeEvent(target, type, callback, options)` - removes event listener
- `addEvents(root, handlers)` - adds multiple event listeners
- `removeEvents(root, handlers)` - removes multiple event listeners

### Animation System

- `doAnimate(element, value, axis, animate, signal)` - animates grid cell changes
- `animateHide(target)` - animates element hiding
- `animateShow(target)` - animates element showing
- `animationSequence(dragCoord, valStart, valEnd, axis)` - creates animation sequence

### Pointer & Drag API

- `agWrapEvent(callback)` - wraps events with pointer coordinate conversion
- `grabForDrag(element, event, options)` - handles drag operations
- `bindDraggable(element, onEnd, draggable, shifting)` - binds draggable behavior
- `clickPrevention(element, pointerId)` - prevents unwanted clicks during drag

### Observation System

- `observeContentBox(element, callback)` - observes content box size changes
- `observeBorderBox(element, callback)` - observes border box size changes
- `observeAttribute(element, attribute, callback)` - observes attribute changes
- `observeAttributeBySelector(element, selector, attribute, callback)` - observes attributes by selector
- `observeBySelector(element, selector, callback)` - observes DOM changes by selector

### Style Management

- `setStyleProperty(element, name, value, importance)` - sets CSS style property
- `setStyleRule(selector, sheet)` - sets CSS rule
- `setStyleInRule(selector, name, value)` - sets property in CSS rule
- `loadInlineStyle(inline, rootElement, layer)` - loads inline styles
- `preloadStyle(styles)` - preloads styles
- `setProperty(target, name, value, importance)` - sets any property

### Grid System

- `getSpan(element, axis)` - gets grid span
- `redirectCell(preCell, gridArgs)` - redirects cell to avoid conflicts
- `convertOrientPxToCX(orientPx, gridArgs, orient)` - converts orientation pixels to cell coordinates
- `floorInOrientPx(orientPx, gridArgs, orient)` - floors coordinates in orientation pixels
- `floorInCX(CX, gridArgs)` - floors cell coordinates

### Utility Functions

- `getOffsetParent(element)` - gets offset parent
- `getOffsetParentChain(element)` - gets chain of offset parents
- `makeRAFCycle()` - creates requestAnimationFrame cycle
- `RAFBehavior(scheduler)` - creates RAF behavior callback
- `setAttributes(element, attrs)` - sets multiple attributes
- `setAttributesIfNull(element, attrs)` - sets attributes only if null
- `clamp(min, val, max)` - clamps value between min and max
- `UUIDv4()` - generates UUID v4
- `camelToKebab(str)` - converts camelCase to kebab-case
- `kebabToCamel(str)` - converts kebab-case to camelCase
- `url(type, ...source)` - creates object URL
- `html(source, type)` - parses HTML string

### Coordinate Conversion

- `cvt_cs_to_os(coords, box, orient)` - converts client space to orientation space
- `getBoundingOrientRect(element, orient)` - gets bounding rect in orientation space
- `orientOf(element)` - gets element orientation

### Measurement & Detection

- `getElementZoom(element)` - gets element zoom level
- `getTransform(element)` - gets element transform
- `getTransformOrigin(element)` - gets element transform origin
- `getPropertyValue(source, name)` - gets CSS property value
- `getPxValue(element, name)` - gets pixel value
- `getPadding(source, axis)` - gets padding values

### Canvas & Shape

- Canvas utilities for drawing operations
- Shape utilities for geometric operations

### Store & Observer

- `Store` - reactive store system
- `Observer` - observation utilities
- `Behavior` - behavior system
- `Mixins` - mixin system

### Legacy Support

- `Geometry` - geometric calculations
- `Query2` - enhanced query system
- `EventBus` - event bus system
- `Boot` - bootstrapping utilities
- `Deprecated` - deprecated functionality

### Polyfills

- `createElement` - element creation polyfill
- `showOpenFilePicker` - file picker polyfill

### CSS Custom Properties

The module automatically sets these CSS custom properties on `:root`:
- `--screen-width` - screen width
- `--screen-height` - screen height
- `--avail-width` - available width
- `--avail-height` - available height
- `--view-height` - viewport height
- `--pixel-ratio` - device pixel ratio
- `--secondary` - secondary orientation flag

### Event Types

- `m-dragstart` - custom drag start event
- `u2-before-hide` - before hide event
- `u2-before-show` - before show event
- All standard DOM events with enhanced pointer support

---

## Object.TS

ModuleName: `fest/object`

### Core Reactivity System

- `makeReactive(target, stateName = "")` - transforms target into reactive entity
    - `target` - target value (object, function, Map, Set, etc.)
    - `stateName` - optional state name for debugging/logging
    - Returns reactive version of the passed value

- `subscribe(tg, cb, ctx = null)` - subscribes callback to reactive object changes
    - `tg` - target reactive object or pair [object, key]
    - `cb` - callback function `(value, prop, old)`
    - `ctx` - callback context
    - Returns unsubscribe function with Symbol.dispose and Symbol.asyncDispose support

- `observe(tg, cb, ctx = null)` - legacy subscription method for arrays
    - `tg` - target reactive object or pair [object, key]
    - `cb` - callback function `(value, prop, old)`
    - `ctx` - callback context
    - Returns unsubscribe function

- `unsubscribe(tg, cb, ctx = null)` - unsubscribes from reactive object
    - `tg` - target reactive object or pair [object, key]
    - `cb` - callback function to unsubscribe (optional)
    - `ctx` - callback context

### Reactive References (Primitives)

- `ref(initial, behavior)` - creates universal reactive reference
    - `initial` - initial value or Promise
    - `behavior` - additional reactive behavior
    - Returns reactive reference with `.value` property

- `numberRef(initial, behavior)` - creates numeric reactive reference
    - `initial` - initial number value or Promise
    - `behavior` - additional reactive behavior
    - Returns reactive reference with numeric `.value`

- `stringRef(initial, behavior)` - creates string reactive reference
    - `initial` - initial string value or Promise
    - `behavior` - additional reactive behavior
    - Returns reactive reference with string `.value`

- `booleanRef(initial, behavior)` - creates boolean reactive reference
    - `initial` - initial boolean value or Promise
    - `behavior` - additional reactive behavior
    - Returns reactive reference with boolean `.value`

- `promised(promise, behavior)` - creates reactive reference from Promise
    - `promise` - Promise to wrap
    - `behavior` - additional reactive behavior
    - Returns reactive reference that resolves with Promise

### Computed & Derived Values

- `computed(src, cb, behavior, prop = "value")` - creates computed reactive value
    - `src` - source reactive object
    - `cb` - computation function
    - `behavior` - additional reactive behavior
    - `prop` - property name (default: "value")
    - Returns computed reactive reference

- `conditional(cond, ifTrue, ifFalse, behavior)` - creates conditional reactive value
    - `cond` - reactive reference or value determining condition
    - `ifTrue` - value returned when condition is true
    - `ifFalse` - value returned when condition is false
    - `behavior` - additional reactive behavior
    - Returns reactive reference switching between values

- `conditionalIndex(condList = [])` - creates conditional index from list
    - `condList` - array of condition functions
    - Returns computed index of first true condition

- `propRef(src, srcProp = "value", behavior, initial)` - creates property reference
    - `src` - source reactive object
    - `srcProp` - source property name
    - `behavior` - additional reactive behavior
    - `initial` - initial value
    - Returns reactive reference bound to source property

### Binding & Linking

- `bindBy(target, reactive, watch)` - binds target to reactive object
    - `target` - target object to bind
    - `reactive` - reactive source object
    - `watch` - watch function for specific properties
    - Returns binding function

- `bindByKey(target, reactive, key)` - binds target to specific reactive key
    - `target` - target object to bind
    - `reactive` - reactive source object
    - `key` - key function returning property name
    - Returns binding function

- `derivate(from, reactFn, watch)` - creates derived reactive object
    - `from` - source reactive object
    - `reactFn` - function to create reactive result
    - `watch` - watch function for specific properties
    - Returns derived reactive object

- `assign(a, b, prop = "value")` - assigns reactive values
    - `a` - target reactive reference
    - `b` - source reactive reference
    - `prop` - property name to assign
    - Returns assignment function

- `link(a, b, prop = "value")` - creates two-way link between references
    - `a` - first reactive reference
    - `b` - second reactive reference
    - `prop` - property name to link
    - Returns linking function

### Utility Functions

- `safe(target)` - safely unwraps reactive objects
    - `target` - target to unwrap
    - Returns plain object without reactive wrappers

- `unwrap(arr)` - unwraps reactive array
    - `arr` - reactive array to unwrap
    - Returns plain array

- `deref(target, discountValue)` - dereferences WeakRef or reactive value
    - `target` - target to dereference
    - `discountValue` - whether to discount .value property
    - Returns dereferenced value

- `isValidObj(obj)` - checks if object is valid for reactivity
    - `obj` - object to check
    - Returns boolean indicating validity

- `isNotEqual(a, b)` - deep equality check
    - `a` - first value
    - `b` - second value
    - Returns boolean indicating inequality

- `isObjectNotEqual(a, b)` - object equality check
    - `a` - first object
    - `b` - second object
    - Returns boolean indicating inequality

### Object Assignment & Manipulation

- `objectAssign(target, value, name, removeNotExists, mergeKey)` - assigns objects reactively
    - `target` - target object
    - `value` - value to assign
    - `name` - property name (optional)
    - `removeNotExists` - whether to remove non-existing properties
    - `mergeKey` - key for merging objects (default: "id")
    - Returns assigned object

- `removeExtra(target, value, name)` - removes extra properties
    - `target` - target object
    - `value` - value to compare against
    - `name` - property name (optional)
    - Returns cleaned object

- `makeObjectAssignable(obj)` - makes object assignable with Proxy
    - `obj` - object to make assignable
    - Returns proxied object

### Promise & Async Support

- `withPromise(target, cb)` - handles Promise or plain values
    - `target` - Promise or plain value
    - `cb` - callback function
    - Returns Promise or immediate result

- `Promised(promise)` - wraps Promise with reactive proxy
    - `promise` - Promise to wrap
    - Returns reactive Promise proxy

- `fixFx(obj)` - fixes function for Promise handling
    - `obj` - object to fix
    - Returns fixed function

### Weak Reference Support

- `WRef(target)` - creates WeakRef proxy
    - `target` - target object or WeakRef
    - Returns WeakRef proxy with reactive behavior

### Delayed Operations

- `delayedSubscribe(ref, cb, delay = 100)` - subscribes with delay
    - `ref` - reactive reference
    - `cb` - callback function
    - `delay` - delay in milliseconds
    - Returns delayed subscription

- `triggerWithDelay(ref, cb, delay = 100)` - triggers callback with delay
    - `ref` - reactive reference
    - `cb` - callback function
    - `delay` - delay in milliseconds
    - Returns timeout ID

- `delayedBehavior(delay = 100)` - creates delayed behavior
    - `delay` - delay in milliseconds
    - Returns delayed behavior function

- `delayedOrInstantBehavior(delay = 100)` - creates instant or delayed behavior
    - `delay` - delay in milliseconds
    - Returns behavior function

### Mapping & Transformation

- `remap(sub, cb, dest)` - remaps reactive subscription
    - `sub` - subscription to remap
    - `cb` - transformation callback
    - `dest` - destination object
    - Returns remapped subscription

- `unified(...subs)` - unifies multiple subscriptions
    - `subs` - array of subscriptions
    - Returns unified subscription

### Observable Collections

- `makeReactiveArray(arr)` - makes array reactive
    - `arr` - array to make reactive
    - Returns reactive array

- `makeReactiveMap(map)` - makes Map reactive
    - `map` - Map to make reactive
    - Returns reactive Map

- `makeReactiveSet(set)` - makes Set reactive
    - `set` - Set to make reactive
    - Returns reactive Set

- `makeReactiveObject(obj)` - makes object reactive
    - `obj` - object to make reactive
    - Returns reactive object

- `observableBySet(set)` - creates observable from Set
    - `set` - Set to observe
    - Returns observable object

- `observableByMap(map)` - creates observable from Map
    - `map` - Map to observe
    - Returns observable object

### Utility Functions

- `UUIDv4()` - generates UUID v4
- `getRandomValues(array)` - gets random values (crypto polyfill)
- `bindFx(target, fx)` - binds function to target context
- `bindCtx(target, fx)` - binds context to function
- `isIterable(obj)` - checks if object is iterable
- `isKeyType(prop)` - checks if property is valid key type
- `mergeByKey(items, key)` - merges items by key
- `associateWith(cb, name)` - associates callback with property name
- `addToCallChain(obj, methodKey, callback)` - adds callback to call chain

### Symbol Support

The module supports these symbols for reactive behavior:
- `Symbol.observable` - Observable protocol support
- `Symbol.subscribe` - Subscription protocol
- `Symbol.iterator` - Iterator protocol
- `Symbol.asyncIterator` - Async iterator protocol
- `Symbol.dispose` - Disposal protocol
- `Symbol.asyncDispose` - Async disposal protocol
- `Symbol.unsubscribe` - Unsubscription protocol
- `Symbol.toPrimitive` - Primitive conversion
- `Symbol.toStringTag` - String representation

### Type Definitions

```
type keyType = string | number | symbol;

interface PropStore {
    unsub?: any;
    bound?: any;
    cmpfx?: any;
    compute?: any;
    dispose?: any;
}
```

---

## FL.UI

ModuleName: `fest/fl-ui`

### Core UI Elements

- `UIElement` - Base UI element class extending GLitElement
    - `theme` - Theme property (default: "default")
    - `onInitialize()` - Initialization callback
    - `onRender()` - Render callback
    - `render()` - Render method returning slot content

### Grid Layout Components

- `UIGridBox` - Grid layout container
    - `size` - Reactive size property [width, height]
    - `classList` - Automatically adds "ui-gridlayout" class
    - ResizeObserver integration for size tracking

- `UIOrientBox` - Orientation-aware container
    - `zoom` - Zoom level property (default: 1)
    - `orient` - Orientation property (default: 0)
    - `size` - Reactive size property [width, height]
    - CSS custom properties: `--orient`, `--zoom`

### Input Components

- `SliderInput` - Universal slider input element
    - `input` - Underlying HTML input element
    - `thumb` - Slider thumb element
    - `handle` - Slider handle element
    - `name` - Input name property
    - `value` - Input value property
    - `valueAsNumber` - Numeric value getter
    - Form-associated element with ARIA support
    - Supports: radio, range, checkbox, number inputs

- `LongTextInput` - Enhanced text input element
    - `input` - Underlying HTML input element
    - `box` - Container box element
    - `name` - Input name property
    - `value` - Input value property
    - Horizontal scrolling with wheel support
    - Auto-creates input element if missing
    - Form-associated element with ARIA support

### Window & Frame Components

- `WindowFrame` - Window frame with titlebar
    - `name` - Window name attribute
    - `icon` - Window icon (default: "app-window")
    - `title` - Window title (default: "WINDOW_FRAME_TITLE")
    - `subtitle` - Window subtitle (default: "WINDOW_FRAME_SUBTITLE")
    - `content` - Content attribute
    - `titlebar` - Titlebar attribute
    - `titlebar-handle` - Titlebar handle attribute
    - `titlebar-app-icon` - App icon attribute
    - `close-icon` - Close button icon (default: "x")
    - `minimize-icon` - Minimize button icon (default: "minus")
    - `maximize-icon` - Maximize button icon (default: "corners-out")
    - Draggable titlebar with resize handle
    - Auto-centering functionality
    - Custom events: "close", "minimize", "maximize"

### Scroll Components

- `ScrollBoxed` - Scrollable container with custom scrollbars
    - `anchor` - Anchor attribute (default: "_")
    - `bindWith(content)` - Binds scrollbars to content element
    - Custom scrollbar styling and behavior

- `OverlayScrollbarMixin` - Mixin for overlay scrollbars
    - Automatically creates scrollframe wrapper
    - Hides native scrollbars
    - Maintains scroll functionality

- `ScrollBar` - Custom scrollbar implementation
    - `scrollbar` - Scrollbar element
    - `content` - Content element
    - `holder` - Holder element
    - `status` - Scroll status object
    - Interactive dragging support
    - Timeline-based animations
    - Visibility control based on scroll position

### Icon Components

- `UIPhosphorIcon` - Icon component with Lucide support
    - `icon` - Icon name attribute
    - `iconStyle` - Icon style (default: "duotone")
    - `width` - Icon width property
    - `iconElement` - SVG element property
    - Automatic icon loading from SVG files
    - Support for different icon styles
    - Mask-based rendering

### Controller Classes

- `DragHandler` - Drag functionality controller
    - `constructor(holder, options)` - Initialize with holder element
    - `draggable(options)` - Enable dragging with options
    - `handler` - Drag handle element (optional)
    - CSS custom properties: `--drag-x`, `--drag-y`

- `ResizeHandler` - Resize functionality controller
    - `constructor(holder, options)` - Initialize with holder element
    - `resizable(options)` - Enable resizing with options
    - `limitResize(real, virtual, holder, container)` - Limit resize bounds
    - `handler` - Resize handle element (optional)
    - CSS custom properties: `--resize-x`, `--resize-y`

- `Trigger` - Event trigger controller
    - `makeShiftTrigger(callback, element)` - Create shift-based trigger
    - `doObserve(element, parent)` - Observe element changes

- `LongPress` - Long press detection controller
- `LongHover` - Long hover detection controller
- `Swipe` - Swipe gesture detection controller

### Input Extension Utilities

- `getInputValues(input)` - Get input values [value, min, max]
- `dragSlider(thumb, handler, input)` - Enable slider dragging
- `clampedValueRef(input)` - Create clamped value reference
- `indicationRef(ref)` - Create formatted value reference
- `boolDepIconRef(condition)` - Create conditional icon reference

### CSS Color System Functions

- `--c2-surface(--tone <number>, --base <color>)` - Surface color generation
- `--c2-contrast(--tone <number>, --base <color>)` - Contrast color generation
- `--c2-on-surface(--tone <number>, --base <color>)` - On-surface color generation
- `--c2-on-contrast(--tone <number>, --base <color>)` - On-contrast color generation

### Available Element Shapes

- `wavy` - Wavy shape variant
- `square` - Square shape variant
- `tear` - Tear shape variant
- `circle` - Circular shape variant

### Web Components

- `<ui-gridbox>` - Grid layout container
- `<ui-orientbox>` - Orientation-aware container
- `<ui-slider>` - Universal slider input
- `<ui-longtext>` - Enhanced text input
- `<ui-window-frame>` - Window frame with titlebar
- `<ui-scrollframe>` - Scrollable container
- `<ui-icon>` - Icon component
- `<ui-element>` - Base UI element

### Mixins

- `ov-scrollbar` - Overlay scrollbar mixin
- `c2-surface` - Surface styling mixin

### CSS Custom Properties

- `--orient` - Orientation value
- `--zoom` - Zoom level
- `--drag-x`, `--drag-y` - Drag offset
- `--resize-x`, `--resize-y` - Resize offset
- `--shift-x`, `--shift-y` - Position shift
- `--scroll-left`, `--scroll-top` - Scroll position
- `--percent-x`, `--percent-y` - Scroll percentage
- `--scroll-size`, `--content-size` - Scroll dimensions

### Event Types

- `close` - Window close event
- `minimize` - Window minimize event
- `maximize` - Window maximize event
- `m-dragstart` - Custom drag start event
- All standard DOM events with enhanced pointer support

### Utility Functions

- `loadAsImage(name, creator)` - Load image with caching
- `rasterizeSVG(blob)` - Convert SVG to object URL
- `capitalizeFirstLetter(str)` - Capitalize first letter
- `stepped(count)` - Generate stepped array
- `makeTimeline(source, axis)` - Create scroll timeline
- `scrollbarCoef(source, axis)` - Calculate scrollbar coefficient
- `scrollSize(source, axis)` - Calculate scroll size
- `controlVisible(source, coef)` - Control scrollbar visibility
- `animateByTimeline(source, properties, timeline)` - Animate with timeline

### Animation & Effects

- `effectProperty` - Default animation properties
- `makeRAFCycle()` - RequestAnimationFrame cycle
- `RAFBehavior(scheduler)` - RAF behavior callback
- Timeline-based animations for scrollbars
- Smooth transitions and easing functions

### Accessibility Features

- ARIA role assignments for form elements
- ARIA value properties for sliders
- ARIA live regions for dynamic content
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Mobile Support

- Touch event handling
- Mobile-friendly input interactions
- Responsive design considerations
- Touch gesture recognition
- Mobile-optimized scrolling

### Performance Features

- WeakRef usage for memory management
- ResizeObserver for efficient size tracking
- RequestAnimationFrame for smooth animations
- Event delegation and optimization
- Lazy loading for icons and resources

---

## About DOM.ts CSS system

ModuleName: `fest/dom`

### CSS Architecture Overview

The DOM.ts CSS system is built on a modular SCSS architecture with the following structure:
- **Properties** - CSS custom properties and @property declarations
- **Layout** - Core layout and positioning systems
- **GridLayout** - Advanced grid-based layout system
- **Mixins** - Reusable SCSS mixins and utilities
- **States** - State-based styling (hidden, dragging, etc.)
- **Normalize** - CSS normalization and reset styles
- **Lib** - Core logic functions and profile utilities

### CSS Custom Properties (@property)

#### Core Properties
- `--ppx` - Pixel unit property (syntax: "<length-percentage>", initial: 1px)
- `--zpx` - Zoom pixel unit (syntax: "<length-percentage>", initial: 1px)
- `--scaling` - Scaling factor (syntax: "<number>", initial: 1)
- `--pixel-ratio` - Device pixel ratio (syntax: "<number>", initial: 1)
- `--secondary` - Secondary orientation flag (syntax: "<integer>", initial: 0)

#### Orientation Properties
- `--ox-orient` - Outer X orientation (syntax: "<number>", initial: 0)
- `--os-orient` - Outer Y orientation (syntax: "<number>", initial: 0)
- `--in-orient` - Inner orientation (syntax: "<number>", initial: 0)
- `--orient` - Current orientation (syntax: "<number>", initial: 0)
- `--zoom` - Zoom level (syntax: "<number>", initial: 1)

#### Transform Properties
- `--translate-x` - X translation (syntax: "<length-percentage>", initial: 0px)
- `--translate-y` - Y translation (syntax: "<length-percentage>", initial: 0px)
- `--opacity` - Opacity value (syntax: "<number>", initial: 1)
- `--scale` - Scale factor (syntax: "<number>", initial: 1)
- `--corrector` - Correction factor (syntax: "<number>", initial: 1)
- `--rot` - Rotation angle (syntax: "<angle>", initial: 0deg)
- `--i-rot` - Inner rotation (syntax: "<angle>", initial: 0deg)

#### Drag & Resize Properties
- `--resize-x` - X resize offset (syntax: "<number>", initial: 0)
- `--resize-y` - Y resize offset (syntax: "<number>", initial: 0)
- `--drag-x` - X drag offset (syntax: "<number>", initial: 0)
- `--drag-y` - Y drag offset (syntax: "<number>", initial: 0)

#### Screen & Viewport Properties
- `--screen-width` - Screen width (syntax: "<length-percentage>", initial: 100dvi)
- `--screen-height` - Screen height (syntax: "<length-percentage>", initial: 100dvb)
- `--avail-width` - Available width (syntax: "<length-percentage>", initial: 100dvi)
- `--avail-height` - Available height (syntax: "<length-percentage>", initial: 100dvb)
- `--view-height` - Viewport height (syntax: "<length-percentage>", initial: 100dvb)

#### Container Query Properties
- `--cqi` - Container query inline size (syntax: "<length-percentage>", initial: 100cqi)
- `--cqb` - Container query block size (syntax: "<length-percentage>", initial: 100cqb)

#### Coordinate System Properties
- `--cs-size-x`, `--cs-size-y` - Client space size
- `--os-size-x`, `--os-size-y` - Orientation space size
- `--cs-self-size-x`, `--cs-self-size-y` - Client space self size
- `--os-self-size-x`, `--os-self-size-y` - Orientation space self size
- `--cs-inset-x`, `--cs-inset-y` - Client space inset
- `--os-inset-x`, `--os-inset-y` - Orientation space inset
- `--in-inset-x`, `--in-inset-y` - Inner inset

#### Border & Padding Properties
- `--border-width` - Border width (syntax: "<length-percentage>", initial: 100%)
- `--border-height` - Border height (syntax: "<length-percentage>", initial: 100%)
- `--avi` - Available inline size (syntax: "<length-percentage>", initial: 0px)
- `--avb` - Available block size (syntax: "<length-percentage>", initial: 0px)

#### Viewport Properties
- `--vp-i-size` - Viewport inline size (syntax: "<length-percentage>", initial: 0px)
- `--vp-b-size` - Viewport block size (syntax: "<length-percentage>", initial: 0px)

#### Keyboard Properties
- `--keyboard-inset-bottom` - Keyboard inset bottom (syntax: "<length-percentage>", initial: 0px)
- `--keyboard-inset-height` - Keyboard inset height (syntax: "<length-percentage>", initial: 0px)

### Layout System

#### Root & Body Layout
```scss
:root, :where(html) {
    position: fixed;
    inset: 0px;
    min-inline-size: 100dvi;
    min-block-size: 100dvb;
    inline-size: 100%;
    block-size: 100%;
    display: flex;
    flex-direction: column;
    place-content: start;
    place-items: start;
    place-self: start;
}
```

#### Body Layout
```scss
:where(body) {
    position: relative;
    inset: 0px;
    display: inline flex;
    place-content: start;
    place-items: start;
    place-self: start;
    min-inline-size: 100dvi;
    min-block-size: 100dvb;
    inline-size: 100%;
    block-size: 100%;
}
```

### Grid Layout System

#### Core Grid Layout
- `.ui-gridlayout` - Main grid layout container
- Grid template: `repeat(var(--cs-layout-c, 4), minmax(0px, 1fr))` columns
- Grid template: `repeat(var(--cs-layout-r, 8), minmax(0px, 1fr))` rows
- Container name: `u2-grid`
- Container type: `normal`

#### Grid Item Properties
- `--layout-c` - Number of columns (default: 4)
- `--layout-r` - Number of rows (default: 8)
- `--ox-c-span` - Column span
- `--ox-r-span` - Row span
- `--cs-grid-c` - Client space grid column
- `--cs-grid-r` - Client space grid row

#### Grid Gaps
- `--c-gap` - Column gap (responsive calculation)
- `--r-gap` - Row gap (responsive calculation)

### Mixins System

#### Orientation Mixins
- `@mixin oriented($property, $portrait, $landscape)` - Orientation-aware properties
- `@mixin compute_os_conditions` - Compute orientation conditions
- `@mixin compute_os_size_to_cs` - Convert orientation space to client space
- `@mixin compute_cs_size_to_os` - Convert client space to orientation space

#### Grid Layout Mixins
- `@mixin compute_orient_grid_layout` - Compute oriented grid layout
- `@mixin compute_grid_item_cell` - Compute grid item cell positioning

#### Layout Mixins
- `@mixin center` - Center content and items
- `@mixin stretch` - Stretch to full size
- `@mixin flex($dir: row)` - Flexbox layout
- `@mixin fit-in-grid($columns: 1, $rows: 1)` - Fit in grid
- `@mixin row-subgrid($column: 1, $columns: 1)` - Row subgrid
- `@mixin column-subgrid($row: 1, $rows: 1)` - Column subgrid

#### Utility Mixins
- `@mixin no-wrap` - Prevent text wrapping
- `@mixin contents` - Transparent wrapper
- `@mixin flex-break` - Flex line break
- `@mixin flex-space` - Flex space distribution
- `@mixin fit-by-block($size, $aspect: "1 / 1")` - Fit by block size
- `@mixin fit-by-inline($size, $aspect: "1 / 1")` - Fit by inline size
- `@mixin clamped-inline($size, $min: "0px", $max: "100%")` - Clamped inline size
- `@mixin clamped-block($size, $min: "0px", $max: "100%")` - Clamped block size

### Logic Functions

#### Mathematical Functions
- `abs($a)` - Absolute value
- `sign($a)` - Sign function
- `mix($a, $b, $i)` - Linear interpolation
- `inv-mul($a, $b)` - Inverse multiplication

#### Comparison Functions
- `gt($a, $b)` - Greater than
- `lt($a, $b)` - Less than
- `ge($a, $b)` - Greater than or equal
- `le($a, $b)` - Less than or equal
- `eq($a, $b)` - Equal
- `ne($a, $b)` - Not equal

#### Logical Functions
- `land($a, $b)` - Logical AND
- `lor($a, $b)` - Logical OR

### State System

#### Hidden State
```scss
*[data-hidden]:not([data-hidden="false"], .u2-while-animation) {
    display: none !important;
    pointer-events: none !important;
    touch-action: none !important;
    content-visibility: hidden !important;
}
```

#### Dragging State
```scss
[data-dragging] {
    will-change: transform;
    transform: translateZ(0px);
    backdrop-filter: none !important;
    user-select: none !important;
}
```

#### Canvas State
```scss
:where(canvas):is([is="ui-canvas"]) {
    position: fixed !important;
    inset: 0px !important;
    display: flex;
    place-content: center;
    place-items: center;
    place-self: center;
    pointer-events: none !important;
}
```

### Normalization System

#### Base Normalization
- Zero margins and padding on root elements
- Border-box sizing for all elements
- Transparent backgrounds by default
- Disabled user selection by default
- Disabled touch actions by default

#### Performance Optimizations
- `content-visibility: auto` for media elements
- `content-visibility: hidden` for empty elements
- `will-change: transform` for interactive elements
- Reduced motion support for accessibility

#### Accessibility Features
- Respects `prefers-reduced-motion` media query
- Proper ARIA support
- Keyboard navigation support
- Screen reader compatibility

### CSS Layers

#### Layer Structure
- `@layer ux-agate` - Core layout and positioning
- `@layer ux-grid-layout` - Grid layout system
- `@layer u2-normalize` - CSS normalization
- `@layer u2-existence` - State-based styling
- `@layer u2-canvas` - Canvas element styling

### Responsive Design

#### Container Queries
- Uses modern container query units (`cqi`, `cqb`)
- Responsive grid gaps based on container size
- Adaptive layouts based on available space

#### Orientation Support
- Automatic orientation detection
- Coordinate system transformation
- Size swapping for different orientations
- Touch-friendly interactions

#### Mobile Optimization
- Touch action management
- Viewport height handling
- Keyboard inset support
- Mobile-optimized scrolling

### Animation System

#### Transform Animations
- Hardware-accelerated transforms
- Smooth coordinate transitions
- Scale and rotation support
- Pixel-perfect positioning

#### Performance Features
- RequestAnimationFrame integration
- GPU acceleration for transforms
- Efficient repaint management
- Optimized animation properties

### Utility Classes

#### Layout Utilities
- `.ui-gridlayout` - Grid layout container
- `.u2-while-animation` - Animation state class
- `[data-hidden]` - Hidden state attribute
- `[data-dragging]` - Dragging state attribute

#### Responsive Utilities
- Container query responsive design
- Orientation-aware layouts
- Touch-friendly interactions
- Mobile-optimized components

### Browser Support

#### Modern Features
- CSS Container Queries
- CSS @property declarations
- CSS Grid Layout
- CSS Logical Properties
- CSS Container Units

#### Fallbacks
- Progressive enhancement approach
- Graceful degradation for older browsers
- Polyfill support where needed
- Feature detection for advanced CSS

### Performance Considerations

#### Optimization Strategies
- Efficient CSS custom properties usage
- Minimal repaints and reflows
- Hardware acceleration for animations
- Optimized selector specificity
- Efficient layout calculations

#### Memory Management
- WeakRef usage for DOM references
- Efficient event delegation
- Optimized observation patterns
- Minimal memory footprint

### Development Workflow

#### SCSS Structure
- Modular SCSS architecture
- Clear separation of concerns
- Reusable mixins and functions
- Consistent naming conventions
- Comprehensive documentation

#### Build Process
- SCSS compilation to CSS
- CSS optimization and minification
- Source map generation
- Development and production builds
- Hot reload support

