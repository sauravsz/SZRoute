import SwiftUI

struct WebhooksView: View {
    @State private var webhooks: [String] = [] // Placeholder for Webhook model
    
    var body: some View {
        Group {
            if webhooks.isEmpty {
                ContentUnavailableView(
                    "No Webhooks Configured",
                    systemImage: "bolt.horizontal.circle",
                    description: Text("Webhooks allow SZRoute to notify external systems when events occur.")
                )
            } else {
                List {
                    // Render webhooks here
                }
            }
        }
        .navigationTitle("Webhooks")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: {
                    // Add Webhook Action
                }) {
                    Label("Add Webhook", systemImage: "plus")
                }
            }
        }
    }
}
