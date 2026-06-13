import Foundation
import Vapor
import Combine

class ServerManager: ObservableObject {
    @Published var isRunning = false
    private var app: Vapor.Application?
    
    init() {
        Task {
            await startServer()
        }
    }
    
    @MainActor
    private func startServer() async {
        do {
            var env = Environment(name: "development", arguments: ["vapor"])
            try LoggingSystem.bootstrap(from: &env)
            
            // Fix Swift 6 async initializer warning
            let app = try await Application.make(env)
            self.app = app
            
            // Configure Server
            app.http.server.configuration.hostname = "127.0.0.1"
            app.http.server.configuration.port = 21128
            
            // Define routes
            _ = ProxyEngine(app: app)
            
            try await app.startup()
            self.isRunning = true
            print("Vapor server started on http://127.0.0.1:21128")
        } catch {
            print("Failed to start server: \(error)")
        }
    }
    
    deinit {
        app?.shutdown()
    }
}
