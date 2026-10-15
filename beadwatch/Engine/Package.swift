// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "BeadEngine",
    platforms: [.macOS(.v13), .iOS(.v17), .watchOS(.v10)],
    products: [
        .library(name: "BeadEngine", targets: ["BeadEngine"]),
    ],
    targets: [
        .target(name: "BeadEngine"),
        .testTarget(name: "BeadEngineTests", dependencies: ["BeadEngine"]),
    ]
)
