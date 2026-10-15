import Foundation

/// Tunable settings for a bead world. Units are points and seconds.
public struct WorldConfig: Equatable, Sendable {
    public var width: Double
    public var height: Double
    public var beadCount: Int
    public var beadRadius: Double
    /// Acceleration for a 1 g input, in points per second squared.
    public var gravityPerG: Double
    /// Fraction of speed lost per second. Higher feels like thicker air.
    public var airDrag: Double
    /// Constraint passes per step. More passes pack deep piles more tightly.
    public var solverIterations: Int

    public init(
        width: Double,
        height: Double,
        beadCount: Int = 900,
        beadRadius: Double = 2.5,
        gravityPerG: Double = 700,
        airDrag: Double = 0.5,
        solverIterations: Int = 8
    ) {
        self.width = width
        self.height = height
        self.beadCount = beadCount
        self.beadRadius = beadRadius
        self.gravityPerG = gravityPerG
        self.airDrag = airDrag
        self.solverIterations = solverIterations
    }
}

/// Beads of water in a rectangle with solid walls.
///
/// Uses a position-based solver: each step predicts positions, projects out
/// wall and bead overlaps, then takes velocity from the corrected motion.
/// Contacts therefore never add energy, which keeps deep piles stable.
public final class BeadWorld {
    public let config: WorldConfig
    public private(set) var positions: [Vec2]
    public private(set) var velocities: [Vec2]
    /// Current gravity in points per second squared, in screen coordinates.
    public private(set) var gravity: Vec2

    private var previous: [Vec2]
    private var rng: SplitMix64
    private let cols: Int
    private let rows: Int
    private var cellHead: [Int]
    private var nextInCell: [Int]

    public init(config: WorldConfig, seed: UInt64) {
        self.config = config
        self.rng = SplitMix64(seed: seed)
        let cellSize = 2 * config.beadRadius
        let columns = max(1, Int(config.width / cellSize) + 1)
        let gridRows = max(1, Int(config.height / cellSize) + 1)
        self.cols = columns
        self.rows = gridRows
        self.cellHead = Array(repeating: -1, count: columns * gridRows)
        self.nextInCell = Array(repeating: -1, count: config.beadCount)
        self.positions = []
        self.previous = []
        self.velocities = Array(repeating: .zero, count: config.beadCount)
        self.gravity = Vec2(0, config.gravityPerG)
        spawnReservoir()
        self.previous = positions
    }

    /// Sets gravity from a direction in screen coordinates (y down), in g.
    /// Lengths above 1 g are scaled down to 1 g.
    public func setGravity(_ direction: Vec2) {
        let length = direction.length
        let scale = length > 1 ? 1 / length : 1
        gravity = direction * (scale * config.gravityPerG)
    }

    /// Kicks every bead by about the same impulse, with a little variation so they spread.
    public func applyImpulse(_ impulse: Vec2) {
        for i in velocities.indices {
            let scale = Double.random(in: 0.85...1.15, using: &rng)
            velocities[i] = velocities[i] + impulse * scale
        }
    }

    /// Advances the simulation by `dt` seconds. Use a fixed step, such as 1/60, for stable results.
    public func step(dt: Double) {
        let damping = exp(-config.airDrag * dt)
        for i in positions.indices {
            previous[i] = positions[i]
            velocities[i] = (velocities[i] + gravity * dt) * damping
            positions[i] = positions[i] + velocities[i] * dt
        }
        for _ in 0..<config.solverIterations {
            keepInsideWalls()
            separateBeads()
        }
        keepInsideWalls()
        for i in positions.indices {
            velocities[i] = (positions[i] - previous[i]) * (1 / dt)
        }
    }

    /// Places beads in a loose grid across the top, so a tilt pours them out.
    private func spawnReservoir() {
        let r = config.beadRadius
        let spacing = 2 * r * 1.05
        let perRow = max(1, Int((config.width - 2 * r) / spacing) + 1)
        for i in 0..<config.beadCount {
            let row = i / perRow
            let col = i % perRow
            let jitterX = Double.random(in: -0.1...0.1, using: &rng) * r
            let jitterY = Double.random(in: -0.1...0.1, using: &rng) * r
            let x = min(config.width - r, r + Double(col) * spacing + jitterX)
            let y = r + Double(row) * spacing + jitterY
            positions.append(Vec2(x, y))
        }
    }

    private func keepInsideWalls() {
        let r = config.beadRadius
        let maxX = config.width - r
        let maxY = config.height - r
        for i in positions.indices {
            positions[i].x = min(max(positions[i].x, r), maxX)
            positions[i].y = min(max(positions[i].y, r), maxY)
        }
    }

    private func separateBeads() {
        let diameter = 2 * config.beadRadius
        for c in cellHead.indices {
            cellHead[c] = -1
        }
        for i in positions.indices {
            let cell = cellRow(positions[i].y) * cols + cellColumn(positions[i].x)
            nextInCell[i] = cellHead[cell]
            cellHead[cell] = i
        }
        for i in positions.indices {
            let cx = cellColumn(positions[i].x)
            let cy = cellRow(positions[i].y)
            for ny in max(0, cy - 1)...min(rows - 1, cy + 1) {
                for nx in max(0, cx - 1)...min(cols - 1, cx + 1) {
                    var j = cellHead[ny * cols + nx]
                    while j != -1 {
                        if j > i {
                            pushApart(i, j, diameter: diameter)
                        }
                        j = nextInCell[j]
                    }
                }
            }
        }
    }

    private func pushApart(_ i: Int, _ j: Int, diameter: Double) {
        let delta = positions[j] - positions[i]
        let distance = delta.length
        guard distance < diameter else { return }

        // Beads sitting exactly on top of each other have no direction, so push them apart along x.
        let n = distance > 1e-9 ? delta * (1 / distance) : Vec2(1, 0)
        let push = (diameter - distance) * 0.5
        positions[i] = positions[i] - n * push
        positions[j] = positions[j] + n * push
    }

    private func cellColumn(_ x: Double) -> Int {
        min(cols - 1, max(0, Int(x / (2 * config.beadRadius))))
    }

    private func cellRow(_ y: Double) -> Int {
        min(rows - 1, max(0, Int(y / (2 * config.beadRadius))))
    }
}
