# Concord POC — User Guide

---

## Level 1 — Install and run

### Download

Go to the [Releases page](https://github.com/matsljunggren-concord-design/concord-poc/releases) and download the DMG for your Mac:

- **Apple Silicon (M1/M2/M3)** → `Concord POC-x.x.x-arm64.dmg`
- **Intel** → `Concord POC-x.x.x.dmg`

Open the DMG and drag **Concord POC** to your Applications folder.

### First launch

Open the app. Because macOS Gatekeeper will block an unsigned app on first launch, right-click the icon in Applications and choose **Open**, then confirm.

The app starts in **emulator mode** by default — no real machine required. You will see a simulated XY machine in the Machine tab that responds to jog commands.

### Connecting to a real machine

Use **Help → Show Config File in Finder**. This creates a template config and opens it in Finder. Edit it with any text editor:

```json
{
  "machines": [
    {
      "id": "machine-1",
      "profile": "uunatek",
      "address": "ws://your-robot.local/ws",
      "primary": true
    }
  ]
}
```

Restart the app after saving. The emulator is disabled once a config file exists.

To keep the emulator running alongside a real machine, add `"emulator": true` to the config.

---

## Level 2 — Load and run a custom script

Scripts live in any folder on your Mac — they do not need to be inside the Concord repo.

### Script format

A script is a plain `.js` file that exports two things:

```js
export const metadata = {
  id: 'my-script',          // unique identifier
  name: 'My Script',        // shown in the list
  description: 'Does something useful.',
};

export async function run({ controller, position, boundary, setPosition, log, api }) {
  log('Starting');

  const target = api.position({ x: position.x + 10, y: position.y + 10 });
  await controller.jump({ position: target });
  setPosition(target);

  log('Done');
}
```

The `run` function receives the current machine state and a set of helpers:

| Property | Description |
|---|---|
| `controller` | Send commands to the machine (`jump`, `move`, etc.) |
| `position` | Current XY position in mm |
| `boundary` | Machine travel limits (`minimumX/Y`, `maximumX/Y`) |
| `setPosition` | Update the UI position after a move |
| `log` | Print a message to the log panel |
| `api.previewPath(positions)` | Draw a path on the canvas |
| `api.clearPreview()` | Clear the path preview |
| `api.dot(position, color?)` | Draw a dot on the canvas |

### Loading scripts in the app

1. Open the **Examples** tab (hamburger menu).
2. Click **Browse examples folder** and select the folder containing your `.js` files.
3. All valid scripts in the folder (and subfolders) appear in the list.
4. Select a script and click **Run**.

After editing a script file, click **Reload** in the drawer to pick up changes without re-browsing.

---

## Level 3 — Debug custom scripts with VS Code

This lets you set breakpoints in your `.js` scripts and step through them while the app runs.

### Requirements

- Concord POC **v0.1.3 or later** (the binary opens a local debug port automatically)
- VS Code with the [JavaScript Debugger](https://marketplace.visualstudio.com/items?itemName=ms-vscode.js-debug) extension (bundled by default)
- The Concord repo open as a workspace in VS Code

### One-time setup

Clone the app repo (includes the examples as a submodule) and open it in VS Code:

```bash
git clone --recurse-submodules https://github.com/matsljunggren-concord-design/concord-poc.git
code concord-poc
```

The `.vscode/launch.json` in the repo already includes the **Attach to Electron Binary** configuration. The example scripts from this repo are checked out at `external/` inside the app repo and are already mapped for breakpoints.

### Debugging workflow

1. **Open the app** — launch Concord POC from Applications normally. The app opens a local debugging port (`localhost:9222`) automatically; nothing extra is needed.

2. **Place your script** in the `external/` folder (this is the [concord-poc-examples](https://github.com/matsljunggren-concord-design/concord-poc-examples) repo checked out as a submodule). Any `.js` file there is already mapped for breakpoints.

3. **Set a breakpoint** — open your `.js` file in VS Code and click the gutter to set a breakpoint.

4. **Attach VS Code** — open the Run & Debug panel (⇧⌘D), select **Attach to Electron Binary** from the dropdown, and press F5. VS Code connects to the running app.

5. **Load and run the script** — in the app, browse to your script folder, select the script, and click Run. VS Code will pause at your breakpoint.

6. Use the standard VS Code debug toolbar to step, inspect variables, and continue.

### Breakpoints in scripts outside `external/`

Breakpoints work out of the box for scripts in `external/`. For scripts in other locations, symlink your folder into `external/`:

```bash
ln -s /path/to/your/scripts external/my-scripts
```

Then browse to `external/my-scripts` inside the app. VS Code will resolve breakpoints via the symlink.
