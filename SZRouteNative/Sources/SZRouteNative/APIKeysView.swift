import SwiftUI

struct APIKeysView: View {
    @StateObject private var dataManager = DataManager()
    @State private var showingAddKey = false
    
    var body: some View {
        Group {
            if dataManager.apiKeys.isEmpty {
                ContentUnavailableView(
                    "No API Keys",
                    systemImage: "key.slash",
                    description: Text("Create an API Key to authenticate requests sent to SZRoute.")
                )
            } else {
                List(dataManager.apiKeys, id: \.id) { key in
                    VStack(alignment: .leading) {
                        Text(key.name)
                            .font(.headline)
                        Text(key.key)
                            .font(.system(.body, design: .monospaced))
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .navigationTitle("API Keys")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: {
                    showingAddKey = true
                }) {
                    Label("Add API Key", systemImage: "plus")
                }
            }
        }
        .sheet(isPresented: $showingAddKey) {
            AddAPIKeyView(dataManager: dataManager, isPresented: $showingAddKey)
        }
    }
}

struct AddAPIKeyView: View {
    @ObservedObject var dataManager: DataManager
    @Binding var isPresented: Bool
    
    @State private var name: String = ""
    @State private var key: String = ""
    
    var body: some View {
        NavigationStack {
            Form {
                TextField("Key Name", text: $name)
                SecureField("API Key Secret", text: $key)
            }
            .padding()
            .navigationTitle("Add API Key")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        isPresented = false
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let newKey = APIKey(
                            id: UUID().uuidString,
                            name: name.isEmpty ? "Unnamed Key" : name,
                            key: key,
                            machineId: nil,
                            allowedModels: "[]",
                            noLog: false,
                            createdAt: ISO8601DateFormatter().string(from: Date())
                        )
                        
                        Task {
                            try? await dataManager.saveAPIKey(newKey)
                            isPresented = false
                        }
                    }
                    .disabled(key.isEmpty)
                }
            }
        }
        .frame(minWidth: 400, minHeight: 250)
    }
}
