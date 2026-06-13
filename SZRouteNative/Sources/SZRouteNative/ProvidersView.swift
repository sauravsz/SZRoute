import SwiftUI

struct ProvidersView: View {
    @StateObject private var dataManager = DataManager()
    @State private var showingAddProvider = false
    
    var body: some View {
        Group {
            if dataManager.providerConnections.isEmpty {
                ContentUnavailableView(
                    "No Providers Configured",
                    systemImage: "server.rack.xmark",
                    description: Text("Connect an upstream provider like OpenAI or Anthropic to start routing requests.")
                )
            } else {
                List(dataManager.providerConnections, id: \.id) { connection in
                    VStack(alignment: .leading) {
                        HStack {
                            Text(connection.name ?? connection.provider)
                                .font(.headline)
                            Spacer()
                            Circle()
                                .fill(connection.isActive ? Color.green : Color.red)
                                .frame(width: 10, height: 10)
                        }
                        Text("Provider: \(connection.provider)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .navigationTitle("Providers")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: {
                    showingAddProvider = true
                }) {
                    Label("Add Provider", systemImage: "plus")
                }
            }
        }
        .sheet(isPresented: $showingAddProvider) {
            AddProviderView(dataManager: dataManager, isPresented: $showingAddProvider)
        }
    }
}

struct AddProviderView: View {
    @ObservedObject var dataManager: DataManager
    @Binding var isPresented: Bool
    
    @State private var provider: String = "BluesMinds"
    @State private var name: String = ""
    @State private var priority: Double = 0
    
    let providers = [
        "BluesMinds", "Gemini", "NVIDIA NIM", "Ollama Cloud",
        "Reka", "Tavily Search", "Command Code", "GitHub Copilot",
        "Google Antigravity", "OpenCode Free"
    ]
    
    var body: some View {
        NavigationStack {
            Form {
                Picker("Provider", selection: $provider) {
                    ForEach(providers, id: \.self) { p in
                        Text(p.capitalized).tag(p)
                    }
                }
                TextField("Custom Name (Optional)", text: $name)
                VStack(alignment: .leading) {
                    Text("Priority: \(Int(priority))")
                    Slider(value: $priority, in: 0...10, step: 1)
                }
            }
            .padding()
            .navigationTitle("Add Provider")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        isPresented = false
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let newConnection = ProviderConnection(
                            id: UUID().uuidString,
                            provider: provider,
                            name: name.isEmpty ? nil : name,
                            priority: Int(priority),
                            isActive: true,
                            proxyEnabled: true,
                            createdAt: ISO8601DateFormatter().string(from: Date()),
                            updatedAt: ISO8601DateFormatter().string(from: Date())
                        )
                        
                        Task {
                            try? await dataManager.saveProviderConnection(newConnection)
                            isPresented = false
                        }
                    }
                }
            }
        }
        .frame(minWidth: 400, minHeight: 300)
    }
}
