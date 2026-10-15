import SwiftUI

@main
struct TrickleApp: App {
    var body: some Scene {
        WindowGroup {
            VStack(spacing: 12) {
                Text("Trickle")
                    .font(.largeTitle.bold())
                Text("Open the Trickle app on your Apple Watch to play.")
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
            }
            .padding()
        }
    }
}
