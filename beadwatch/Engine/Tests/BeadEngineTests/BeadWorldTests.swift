import XCTest
import BeadEngine

final class BeadWorldTests: XCTestCase {
    private let dt = 1.0 / 60.0

    private func makeWorld(seed: UInt64 = 42) -> BeadWorld {
        BeadWorld(config: WorldConfig(width: 180, height: 220), seed: seed)
    }

    private func run(_ world: BeadWorld, steps: Int) {
        for _ in 0..<steps {
            world.step(dt: dt)
        }
    }

    private func averageY(_ world: BeadWorld) -> Double {
        world.positions.reduce(0) { $0 + $1.y } / Double(world.positions.count)
    }

    func testSameSeedGivesSameResult() {
        let a = makeWorld(seed: 7)
        let b = makeWorld(seed: 7)
        a.setGravity(Vec2(0.3, 0.9))
        b.setGravity(Vec2(0.3, 0.9))
        run(a, steps: 120)
        run(b, steps: 120)
        XCTAssertEqual(a.positions, b.positions)
    }

    func testBeadsStayInsideTheWalls() {
        let world = makeWorld()
        let directions = [Vec2(0, 1), Vec2(1, 0.4), Vec2(-1, 0.2), Vec2(0.2, -1)]
        for step in 0..<600 {
            if step % 60 == 0 {
                world.setGravity(directions[(step / 60) % directions.count])
            }
            world.step(dt: dt)
        }
        let r = world.config.beadRadius
        for p in world.positions {
            XCTAssertGreaterThanOrEqual(p.x, r - 1e-9)
            XCTAssertLessThanOrEqual(p.x, world.config.width - r + 1e-9)
            XCTAssertGreaterThanOrEqual(p.y, r - 1e-9)
            XCTAssertLessThanOrEqual(p.y, world.config.height - r + 1e-9)
        }
    }

    func testGravityPullsBeadsDown() {
        let world = makeWorld()
        world.setGravity(Vec2(0, 1))
        let before = averageY(world)
        run(world, steps: 120)
        XCTAssertGreaterThan(averageY(world), before + 20)
    }

    func testBeadsDoNotSinkIntoEachOther() {
        let world = makeWorld()
        world.setGravity(Vec2(0, 1))
        run(world, steps: 900)
        let diameter = 2 * world.config.beadRadius
        let p = world.positions
        var worstOverlap = 0.0
        for i in p.indices {
            for j in (i + 1)..<p.count {
                let overlap = diameter - (p[j] - p[i]).length
                worstOverlap = max(worstOverlap, overlap)
            }
        }
        XCTAssertLessThan(worstOverlap, 0.5 * diameter)
    }

    func testFlickLiftsBeadsThenTheyFallBack() {
        let world = makeWorld()
        world.setGravity(Vec2(0, 1))
        run(world, steps: 900)
        let resting = averageY(world)
        world.applyImpulse(Vec2(0, -900))
        run(world, steps: 10)
        XCTAssertLessThan(averageY(world), resting - 5)
        run(world, steps: 1200)
        XCTAssertEqual(averageY(world), resting, accuracy: 0.1 * world.config.height)
    }
}
