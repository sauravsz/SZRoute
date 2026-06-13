import Foundation
import GRDB

@MainActor
class DataManager: ObservableObject {
    @Published var apiKeys: [APIKey] = []
    @Published var providerConnections: [ProviderConnection] = []
    
    init() {
        Task {
            await fetchAll()
        }
    }
    
    func fetchAll() async {
        do {
            guard let dbPool = DatabaseManager.shared.dbPool else { return }
            
            let fetchedKeys = try await dbPool.read { db in
                try APIKey.fetchAll(db)
            }
            let fetchedConnections = try await dbPool.read { db in
                try ProviderConnection.fetchAll(db)
            }
            
            self.apiKeys = fetchedKeys
            self.providerConnections = fetchedConnections
        } catch {
            print("Failed to fetch data: \(error)")
        }
    }
    
    func saveAPIKey(_ key: APIKey) async throws {
        guard let dbPool = DatabaseManager.shared.dbPool else { return }
        try await dbPool.write { db in
            try key.save(db)
        }
        await fetchAll()
    }
    
    func deleteAPIKey(id: String) async throws {
        guard let dbPool = DatabaseManager.shared.dbPool else { return }
        try await dbPool.write { db in
            _ = try APIKey.deleteOne(db, id: id)
        }
        await fetchAll()
    }
    
    func saveProviderConnection(_ connection: ProviderConnection) async throws {
        guard let dbPool = DatabaseManager.shared.dbPool else { return }
        try await dbPool.write { db in
            try connection.save(db)
        }
        await fetchAll()
    }
    
    func deleteProviderConnection(id: String) async throws {
        guard let dbPool = DatabaseManager.shared.dbPool else { return }
        try await dbPool.write { db in
            _ = try ProviderConnection.deleteOne(db, id: id)
        }
        await fetchAll()
    }
}
