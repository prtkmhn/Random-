import SwiftUI

struct ContentView: View {
    @State private var model = BeadModel()

    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas { context, size in
                model.advance(to: timeline.date, size: size)

                let r = model.beadRadius
                var beads = Path()
                for p in model.positions {
                    beads.addEllipse(in: CGRect(x: p.x - r, y: p.y - r, width: 2 * r, height: 2 * r))
                }
                context.fill(beads, with: .color(.cyan))
            }
        }
        .background(Color.black)
        .ignoresSafeArea()
        .onAppear { model.start() }
        .onDisappear { model.stop() }
    }
}
