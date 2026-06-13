import Foundation
import GRDB

// MARK: - Models

struct APIKey: Codable, FetchableRecord, PersistableRecord, Identifiable {
    var id: String
    var name: String
    var key: String
    var machineId: String?
    var allowedModels: String // JSON array string
    var noLog: Bool
    var createdAt: String
    
    static let databaseTableName = "api_keys"
}

struct ProviderConnection: Codable, FetchableRecord, PersistableRecord, Identifiable {
    var id: String
    var provider: String
    var name: String?
    var priority: Int
    var isActive: Bool
    var proxyEnabled: Bool
    var createdAt: String
    var updatedAt: String
    
    static let databaseTableName = "provider_connections"
}

// MARK: - Database Manager

class DatabaseManager {
    static let shared = DatabaseManager()
    
    var dbPool: DatabasePool!
    
    private init() { }
    
    func setup(at path: String) throws {
        dbPool = try DatabasePool(path: path)
        try migrator.migrate(dbPool)
    }
    
    private var migrator: DatabaseMigrator {
        var migrator = DatabaseMigrator()
        
        migrator.registerMigration("v1") { db in
            try db.create(table: "api_keys") { t in
                t.column("id", .text).primaryKey()
                t.column("name", .text).notNull()
                t.column("key", .text).notNull().unique()
                t.column("machine_id", .text)
                t.column("allowed_models", .text).defaults(to: "[]")
                t.column("no_log", .boolean).notNull().defaults(to: false)
                t.column("created_at", .text).notNull()
            }
            try db.create(index: "idx_ak_key", on: "api_keys", columns: ["key"])
            
            try db.create(table: "provider_connections") { t in
                t.column("id", .text).primaryKey()
                t.column("provider", .text).notNull()
                t.column("name", .text)
                t.column("priority", .integer).defaults(to: 0)
                t.column("is_active", .boolean).defaults(to: true)
                t.column("proxy_enabled", .boolean).notNull().defaults(to: true)
                t.column("created_at", .text).notNull()
                t.column("updated_at", .text).notNull()
            }
            try db.create(index: "idx_pc_provider", on: "provider_connections", columns: ["provider"])
        }
        
        return migrator
    }
}
