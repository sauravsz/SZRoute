import SwiftUI

struct LiveLogsView: View {
    @State private var logs: [String] = []
    let timer = Timer.publish(every: 1.0, on: .main, in: .common).autoconnect()
    
    var body: some View {
        VStack {
            List(logs, id: \.self) { log in
                Text(log)
                    .font(.system(.caption, design: .monospaced))
            }
            .listStyle(.plain)
        }
        .navigationTitle("Live Logs")
        .onReceive(timer) { _ in
            let date = Date()
            let formatter = DateFormatter()
            formatter.dateFormat = "HH:mm:ss"
            let timeString = formatter.string(from: date)
            logs.insert("[\(timeString)] Proxy engine intercepting traffic on port 21128...", at: 0)
            if logs.count > 100 {
                logs.removeLast()
            }
        }
    }
}

struct LogsRouterView: View {
    @Environment(\.openWindow) private var openWindow
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "terminal.fill")
                .font(.system(size: 64))
                .foregroundColor(.secondary)
            
            Text("Live Logging")
                .font(.title)
            
            Text("Logs are viewed in a detached utility window to maximize screen real estate.")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding(.horizontal)
            
            Button("Open Detached Logs Window") {
                openWindow(id: "logs")
            }
            .buttonStyle(.borderedProminent)
        }
        .navigationTitle("Logs")
    }
}
