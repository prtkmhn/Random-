# Install Trickle on an Apple Watch from a Mac (free)

This file is for an AI agent running on a Mac. Follow the steps in order.
Steps marked **[OWNER]** need the watch owner in person. Stop and ask at those steps.

**Warning:** this procedure has not been run on a real Mac yet. Expect small
differences. If a step fails, stop and report the exact error. Do not guess.

## Rules for the agent

- Never ask for, read, or store an Apple ID password, 2FA code, or the Mac login password. The owner types those.
- Never change security settings, except Developer Mode, which only the owner turns on.
- Never commit, push, or change the GitHub repo. Work only in a local folder.
- Install only Xcode, Homebrew, and XcodeGen.
- Report the result of every step to the owner, including the ones that pass.

## What the owner needs

- A Mac with macOS that current Xcode supports, and about 20 GB free disk space.
- The owner's iPhone, paired to the Apple Watch, with a charging cable.
- A free Apple ID that belongs to the owner.

## Step 1: Check the Mac

```
sw_vers -productVersion
xcode-select -p
```

Report the macOS version. `xcode-select -p` may fail if Xcode is missing. That's fine, go to Step 2.

## Step 2: Install Xcode **[OWNER]**

1. Open the Mac App Store, search for Xcode, and install it (free, large).
2. Open Xcode once and accept the license.
3. Verify:
   ```
   xcodebuild -version
   ```
   It should print an Xcode version. If it asks for a password to accept the license, the owner types it.

## Step 3: Install Homebrew and XcodeGen

1. If `brew --version` fails, ask the owner before installing Homebrew from https://brew.sh.
2. Install XcodeGen:
   ```
   brew install xcodegen
   xcodegen --version
   ```

## Step 4: Get the code

```
git clone --depth 1 --branch claude/beadfall-apple-watch-plan-yuqepm https://github.com/prtkmhn/Random-.git trickle-src
cd trickle-src/beadwatch
```

If `git` is missing, download the zip instead:
https://github.com/prtkmhn/Random-/archive/refs/heads/claude/beadfall-apple-watch-plan-yuqepm.zip
Unzip it and `cd` into the `beadwatch` folder.

## Step 5: Choose a unique bundle ID **[OWNER]**

Free Apple accounts need bundle IDs no one else uses. Ask the owner for a short name
of lowercase letters only, such as `jdoe`. Then:

```
sed -i '' "s/com.example/com.NAME/g" project.yml
grep -c "com.NAME" project.yml
```

Replace `NAME` with the owner's name in both commands. The `grep` count should be at least 3.

## Step 6: Generate the Xcode project

```
xcodegen generate --spec project.yml
```

This creates `Trickle.xcodeproj`.

## Step 7: Sign in and set the team **[OWNER]**

1. Open `Trickle.xcodeproj` in Xcode.
2. Go to Xcode > Settings > Accounts, click +, choose Apple ID, and sign in with the owner's own free Apple ID. The owner types the password.
3. Select the **Trickle** target, open Signing & Capabilities, keep "Automatically manage signing" on, and choose the "(Personal Team)" option under Team.
4. Repeat for the **TrickleWatch** target.
5. Tell the agent when both targets show no signing errors.

Then the agent reads the team ID from the signing certificate:

```
security find-identity -v -p codesigning
```

Look for a line like `Apple Development: ... (XXXXXXXXXX)`. The 10 characters in the
parentheses are the **TEAM_ID**. Report it.

## Step 8: Connect the iPhone **[OWNER]**

1. Plug the iPhone into the Mac, unlock it, and tap Trust.
2. On the iPhone, go to Settings > Privacy & Security > Developer Mode and turn it on. The phone restarts and asks for confirmation.
3. Keep the iPhone unlocked and near the Mac during the build.

Then the agent finds the phone's ID:

```
xcrun devicectl list devices
```

Record the identifier of the iPhone, which is the **IPHONE_ID**. If the watch is paired, it may also appear in this list. Report what you see.

## Step 9: Build for the iPhone (this also builds the watch app)

```
xcodebuild -project Trickle.xcodeproj -scheme Trickle \
  -destination "id=IPHONE_ID" \
  -allowProvisioningUpdates DEVELOPMENT_TEAM=TEAM_ID \
  -derivedDataPath build build
```

Replace `IPHONE_ID` and `TEAM_ID`. Report the final line of output.

## Step 10: Install on the iPhone

```
xcrun devicectl device install app --device IPHONE_ID build/Build/Products/Debug-iphoneos/Trickle.app
```

## Step 11: Put Trickle on the watch **[OWNER]**

1. On the iPhone, open the Watch app.
2. Scroll to **Available Apps**. If Trickle is listed, tap **Install**.
3. If it doesn't appear, the watch app may need Developer Mode on the watch too. The owner checks Settings > Privacy & Security > Developer Mode on the watch, if that item exists. Report what you see, since this step has not been verified.
4. On the watch, open Trickle from the app grid.

## Step 12: Verify **[OWNER]**

The owner confirms on the watch:
- Beads show on screen.
- Tilting the wrist makes them pour.
- A quick flick sends them up and they fall back.

Report pass or fail, plus anything unexpected. Note that the Simulator sway is not the
same as a real tilt, so the feel on the wrist is the real test.

## Every 7 days: renew

Free Apple accounts expire app installs after 7 days. To renew, repeat **Step 9 and Step 10** on the same Mac. The owner doesn't need to re-enter the Apple ID.

## Troubleshooting

| Error | Likely fix |
|---|---|
| `No signing certificate` | Step 7 is not finished. |
| `bundle identifier ... is not available` or `failed to register` | Pick another name in Step 5, then run Step 6 again. |
| `device is not available` or `not paired` | Unlock the iPhone, tap Trust, and check Developer Mode (Step 8). |
| Build works but Trickle is missing from Available Apps | Check Step 11, item 3. |
| `maximum number of apps` | The owner deletes an old sideloaded app from the iPhone. Free accounts allow three. |

## Report back

Give the owner a short summary: which steps passed, the exact error for any step that
failed, and whether Trickle opens on the watch.
