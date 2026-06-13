import SwiftUI

struct SidebarView: View {
    @Binding var selection: NavigationItem?
    
    var body: some View {
        List(selection: $selection) {
            Section(header: Text("Overview")) {
                NavigationLink(value: NavigationItem.dashboard) {
                    Label("Dashboard", systemImage: "squareshape.split.2x2")
                }
            }
            
            Section(header: Text("Routing")) {
                NavigationLink(value: NavigationItem.providers) {
                    Label("Providers", systemImage: "server.rack")
                }
                NavigationLink(value: NavigationItem.webhooks) {
                    Label("Webhooks", systemImage: "bolt.horizontal")
                }
            }
            
            Section(header: Text("Security")) {
                NavigationLink(value: NavigationItem.apiKeys) {
                    Label("API Keys", systemImage: "key.fill")
                }
            }
            
            Section(header: Text("Monitoring")) {
                NavigationLink(value: NavigationItem.logs) {
                    Label("Live Logs", systemImage: "terminal")
                }
            }
        }
        .listStyle(.sidebar)
        .navigationTitle("SZRoute")
    }
}

enum NavigationItem: Hashable {
    case dashboard
    case providers
    case webhooks
    case apiKeys
    case logs
}
