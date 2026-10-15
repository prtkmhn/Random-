import BeadEngine
import CoreGraphics
import CoreMotion
import Foundation

/// Feeds watch motion into the bead world and advances it in fixed steps.
final class BeadModel {
    private let motion = CMMotionManager()
    private var world: BeadWorld?
    private var worldSize = CGSize.zero
    private var lastDate: Date?
    private var accumulator = 0.0
    private var gravity = Vec2(0, 1)
    private var pendingImpulse: Vec2?
    private var lastFlick = Date.distantPast

    private let stepSize = 1.0 / 60.0
    /// User acceleration, in g, that counts as a flick.
    private let flickThreshold = 2.2
    private let flickCooldown = 0.7
    private let flickSpeed = 900.0

    var positions: [Vec2] { world?.positions ?? [] }
    var beadRadius: Double { world?.config.beadRadius ?? 0 }

    func start() {
        guard motion.isDeviceMotionAvailable, !motion.isDeviceMotionActive else { return }
        motion.deviceMotionUpdateInterval = 1.0 / 30.0
        motion.startDeviceMotionUpdates(to: .main) { [weak self] data, _ in
            guard let self, let data else { return }
            self.handle(data)
        }
    }

    func stop() {
        motion.stopDeviceMotionUpdates()
    }

    /// Advances the simulation to `date`. Called once per frame from the Canvas.
    func advance(to date: Date, size: CGSize) {
        guard size.width > 0, size.height > 0 else { return }
        if world == nil || size != worldSize {
            worldSize = size
            world = BeadWorld(
                config: WorldConfig(width: Double(size.width), height: Double(size.height)),
                seed: 1
            )
            accumulator = 0
        }
        guard let world else { return }

        // Real elapsed time, capped so a long pause doesn't dump a huge step.
        let elapsed = min(date.timeIntervalSince(lastDate ?? date), 0.1)
        lastDate = date
        accumulator += elapsed

        world.setGravity(gravity)
        if let impulse = pendingImpulse {
            world.applyImpulse(impulse)
            pendingImpulse = nil
        }
        while accumulator >= stepSize {
            world.step(dt: stepSize)
            accumulator -= stepSize
        }
    }

    private func handle(_ data: CMDeviceMotion) {
        // The in-plane part of gravity pours the beads. Device y points up the
        // screen; screen y points down, so the sign flips.
        let g = data.gravity
        gravity = Vec2(g.x, -g.y)

        let a = data.userAcceleration
        let strength = (a.x * a.x + a.y * a.y + a.z * a.z).squareRoot()
        let now = Date()
        if strength > flickThreshold, now.timeIntervalSince(lastFlick) > flickCooldown {
            lastFlick = now
            pendingImpulse = Vec2(0, -flickSpeed)
        }
    }
}
