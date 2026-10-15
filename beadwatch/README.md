# Beadwatch: free watch bead-physics toy (cloud-only plan)

Status: **DRAFT, awaiting your approval.** Nothing below is built yet.

## 1. Goal

A free, original Apple Watch toy: about 900 simulated beads of water on your wrist.
Tilt the watch and the beads pour. Flick and they climb the wall, then fall back.
No score, no notifications, no accounts, no network.

This is an original build, not a copy. The app will not reuse the Beadfall name, icon,
art, sounds, code, or store text. The idea of bead physics on a watch is not protected.

## 2. Name (pick one)

- Trickle
- Tidewrist
- Sluice

Each name needs an App Store availability check before we publish. None is used yet.

## 3. What the public page says about the original (the spec source)

Source: https://hunted.space/product/beadfall

- Apple Watch only, one-time purchase, no ads, no accounts, no network code.
- About 900 beads. Tilt pours them. A flick sends them up a wall before they fall.
- Physics run on the watch at 60 fps, drawn on the CPU.
- No score, no notifications, nothing to achieve. Sound off in v1.

## 4. What we still need from you (observations)

Only you can see the app on your watch. Please describe or screenshot:
- Bead size, colour, and how they look when they pile up.
- The wall: where it is and how a flick launches beads.
- How tilt maps to pouring (speed, dead zone).
- Does the screen dim while tilting? Does a tap wake it?

We'll write these into section 5 as our own design choices, not copied behaviour.

## 5. v1 scope (proposal)

- Bead count: 900 default, tunable.
- Tilt pours via CoreMotion gravity. Flick applies an impulse toward the wall.
- Beads collide, pile, and rest. Simple, stable settling.
- Dim while tilting, tap to wake.
- Minimum watchOS: 10 (proposed; we confirm against your watch).
- Sound: optional, off by default.

Out of scope for v1: score, notifications, accounts, complications, multiple themes.

## 6. Architecture

- `physics/` JavaScript prototype, runs in a browser and under `node --test` in the cloud. No Apple tools needed.
- `watch/engine/` pure Swift (Foundation only), ported from the prototype, with XCTest tests.
- `watch/app/` SwiftUI watch app drawing with Canvas, CoreMotion for tilt.
- `ios/` minimal companion iPhone app (watchOS apps must ship inside one).
- `project.yml` for XcodeGen, so the Xcode project is generated in CI and no `.pbxproj` is hand-written.

## 7. Cloud pipeline (no Mac anywhere)

- GitHub Actions on a macOS runner. The repo is public, so macOS minutes are free.
- Pin an explicit runner label, not `macos-latest`.
- Run XCTest on the watchOS simulator, which the runner image includes.
- Archive, sign, and upload to TestFlight using an App Store Connect API key.
- I read the CI logs and fix failures. I can't see the watch.

## 8. Steps only you can do

These need your Apple account and card, so I can't do them for you:

1. Enroll in the Apple Developer Program ($99/year) at developer.apple.com, in any browser.
2. Create an App Store Connect API key (Users and Access > Integrations).
3. Add four GitHub repo secrets with these names:
   - `APP_STORE_CONNECT_KEY_ID`
   - `APP_STORE_CONNECT_ISSUER_ID`
   - `APP_STORE_CONNECT_PRIVATE_KEY` (contents of the .p8 file)
   - `APPLE_TEAM_ID`
4. Install the TestFlight app on your iPhone and accept the invite. The watch app then appears on your watch (we'll confirm the exact steps when we get there).

## 9. Phases and gates

- [ ] **Gate A: you approve this plan and the $99/year cost.**
- [ ] **Phase 1, spec:** you approve section 5 and pick a name.
- [ ] **Phase 2, physics prototype:** JS engine with `node --test`. You approve how it feels.
- [ ] **Phase 3, Swift port and CI:** engine plus watch app, CI tests pass on the watchOS simulator. You approve the workflow file.
- [ ] **Phase 4, signing and upload:** CI produces a TestFlight build. You complete section 8 and confirm the build appears.
- [ ] **Phase 5, on-watch test:** you install via TestFlight, test on the watch, and report feel and frame rate.

## 10. Risks (verified later, not assumed)

- Signing from CI with only an API key has not been tested. If it fails, the fallback is `fastlane match`.
- TestFlight delivery of watch apps is what we expect, not something I've confirmed. We check at Phase 4.
- Feel, battery, and frame rate can only be judged on the watch.
- TestFlight builds expire after 90 days, so the build needs re-uploading occasionally.
