import SwiftUI
import GRDB

@main
struct SZRouteNativeApp: App {
    @StateObject private var serverManager = ServerManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(serverManager)
        }
        .windowStyle(.hiddenTitleBar)
        
        WindowGroup(id: "logs") {
            LiveLogsView()
                .environmentObject(serverManager)
        }
        .windowStyle(.hiddenTitleBar)
        .defaultSize(width: 600, height: 400)
        
        MenuBarExtra("SZRoute", systemImage: "server.rack") {
            Button(serverManager.isRunning ? "Server is Running" : "Server Offline") {
                // Toggle server
            }
            .disabled(true)
            
            Divider()
            
            Button("Open Dashboard") {
                if let url = URL(string: "http://127.0.0.1:21128") {
                    NSWorkspace.shared.open(url)
                }
            }
            
            Divider()
            
            Button("Quit") {
                NSApplication.shared.terminate(nil)
            }
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var serverManager: ServerManager
    @State private var selection: NavigationItem? = .dashboard
    
    var body: some View {
        NavigationSplitView {
            SidebarView(selection: $selection)
        } detail: {
            switch selection {
            case .dashboard:
                DashboardView()
            case .providers:
                ProvidersView()
            case .webhooks:
                WebhooksView()
            case .apiKeys:
                APIKeysView()
            case .logs:
                Text("Live Logs Native View") // To be implemented
            case .none:
                Text("Select an item")
            }
        }
    }
}

struct DashboardView: View {
    @EnvironmentObject var serverManager: ServerManager
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "server.rack")
                .font(.system(size: 64))
                .foregroundColor(serverManager.isRunning ? .green : .red)
            
            Text(serverManager.isRunning ? "Proxy Server Online" : "Server Offline")
                .font(.title)
            
            Text("Port: 21128")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .navigationTitle("Dashboard")
    }
}
