# TODO-Project

Type:
- Frontend
- Web

UIComponents:
- [x] Scrollbars
    - [x] Overlays
- [x] Wallpaper Image
    - [x] Orientaton
    - [x] Updating
    - [x] Optimization
    - [x] Resize Support
    - [x] Scaling Support
    - [x] DPI/PPI Support
- [ ] Custom Inputs (wrappers)
    - [x] Long-Text (code, url, json edit)
    - [x] Slider (number, range, radio, checkbox)
    - [ ] Clipboard (copy, paste)
    - [ ] FieldEditor (mobile, accessibility, not-imp)
    - [ ] Toggle (checkbox, button, radio)
- [ ] Input Appearance
    - [ ] Slider (number)
    - [ ] Switch (number, checkbox)
    - [ ] Button (checkbox, button)
- [ ] Context and Drop Menu
    - [x] Has initiator prop
    - [x] Depends by context (???)
    - [ ] Differs by trigger
        - [ ] Interaction
        - [x] RightClick
    - [ ] Differs by anchor
        - [ ] From Element
        - [x] From Clicked
        - [ ] From Cursor
    - [ ] Layouts
        - [x] Grid Row Flow
    - [x] Item Layouts
        - [x] [Icon?|Label|Mark?]
- [ ] TaskBar (connected with TaskManagerAPI)
    - [ ] For Mobile
    - [ ] For Desktop
- [ ] NavBar (connected with TaskManagerAPI)
    - [ ] Subtype of Taskbar
    - [ ] Or Window Frame?
- [ ] StatusBar (used reactive variables)
    - [ ] In Mobile (default)
- [x] Indicators (by variables)
    - [x] Time Display
    - [x] Signal Display
    - [x] Battery Display
    - [ ] Shared with Task and Status Bar
- [ ] Panels (see Modal next)
    - [ ] Calendar
    - [ ] Quick Settings

WSGridSystem:
- [x] Reactive Layout
    - [Columns, Rows]
    - Type (Label, Icons)
- [ ] Reactive Items (with ID)
    - [x] Layout Properties [UI]
        - Cell[x,y]
    - [ ] Item Properties [Desc]
        - ActionID
        - HREF
        - IconID
        - Label
- [ ] Edit item action properties
- [x] Iteraction
    - [x] Dragging/Move
    - [x] Pointer Events
    - [x] Drop-Animation
    - [x] Drop-To-Cell

Design:
- [x] Color theme system
    - [x] Computed Matrix Based
    - [x] Component Based
- [ ] Inputs design essentials
    - [x] Draggable (WIP)
- [ ] Layout design essentials
    - [ ] Grid List Typed
    - [ ] Window Frame

Animation:
- [ ] Enabled properties (usage)
- [ ] Animated properties
- [ ] Behaviour configure
- [ ] Exactly (Under Consideration)
    - [x] Partially
    - [ ] Opacity
    - [ ] Scale
    - [ ] Colors

TasksAPI:
- [ ] Render UI (web-comp) depends by "TYPE"
- [ ] Share API (permissions) for that Task
- [ ] API providing based systems (wrapping)
- [ ] Bind actions for elements
    - [ ] Provide context
    - [ ] Provide commands
    - [ ] Provide API wrap
- [ ] Status-Flags: focus, minimized, maximized
    - [ ] Focus can't be minimized
- [ ] UI-Properties...
    - [ ] Resize
    - [ ] Shift

ActionSystemAPI:
- [ ] Conditions of appear
- [ ] What to add/change/act/enable
- [ ] Special Registry and Library

GlobalReactiveVariables:
- [x] UTC Local Time   (read-only, real-time)
- [x] Battery Status   (read-only, real-time)
- [x] Signal Status    (read-only, real-time)
- [ ] Base-Theme-Color (in CSS color formats)
- [ ] Wallpaper Image  (URL, directory, etc.)
- [ ] Light-Dark-Flag  (0:dark, 1:light, -1:auto)
- [x] Orientation      (prepared, API-ready)

SharingFeature:
- [ ] Copy/Paste JSON meta from icon items
- [ ] Import/Export JSON options/settings

FileManagementAPI:
- [ ] Setting Wallpaper
- [ ] Storing user data
- [ ] Access for shared
- [x] Opened File Handle
    - [x] Directory
    - [x] Files
- [ ] System Integration
    - [ ] Picking
    - [ ] Dropping
    - [ ] Dragging
    - [ ] Clipboard

Dialogs:
- [ ] Modal
- [ ] Message
- [ ] Confirmation
- [ ] Questions
- [ ] Property Editor
    - [ ] Form Linking
- [ ] Used as Panels
    - [ ] Quick Settings
    - [ ] Calendar

UITaskTypes:
- [ ] File Manager
    - [ ] List View (Grid, Row-Typed)
    - [ ] Grid View (Grid, Column-Typed, Wrapped)
- [ ] File Viewer
- [ ] File Commander
- [ ] File Picker
- [ ] Control Center
    - [ ] Slider Inputs
    - [ ] Drop Menus
    - [ ] Tabs
    - [ ] View Split
    - [ ] Side Panel
    - [ ] Adaptivity
- [ ] Picture Viewer
- [ ] Web Page Viewer
- [ ] Markdown Viewer

CoordinateSystemAPI:
- [x] CSS Orientation
- [x] CSS Variables
- [ ] Layout
    - [x] Absolute
    - [ ] Grid
- [x] Reactive Variable

InteractionAPI:
- [x] Dragging
- [x] Resizing
- [x] LongPress
- [x] LongHover
- [x] ShiftTrigger
- [ ] ???

DOMLayout:
- [x] CSS Resets
- [x] CSS Normalize
- [x] Optimizations
- [x] Styles, Fonts
- [ ] Layers (incomplete)
- [ ] API (still in working)

ReactiveSystem (COMPLETE):
- [x] DataTypes
    - [x] Object
    - [x] Refs
    - [x] Sets
    - [x] Maps
    - [x] Arrays
- [x] Aggregations
    - [x] Computed
    - [x] Conditional
    - [x] Assigned
    - [x] Linked
- [x] Subscribtion System
- [x] Triggers
    - [x] DOM Events
    - [x] Observers
    - [x] Timers
- [x] Bindings
    - [x] Properties
    - [x] Attributes
    - [x] Styles
- [x] Linking
    - [x] Storage
    - [x] Inputs
    - [x] Forms
- [x] Behaviour
    - [x] RAF-Throttled
