export function registerProvider(program) {
  program
    .command("provider [subcommand]")
    .description("Manage provider connections (use 'providers' for the full interface)")
    .allowUnknownOption()
    .allowExcessArguments()
    .action(() => {
      console.log(`
  Use \`szroute providers\` for the full provider management interface:

    szroute providers available   — show provider catalog
    szroute providers list        — list configured connections
    szroute providers test <name> — test a provider connection
    szroute providers test-all    — test all active connections
    szroute providers validate    — validate local configuration
`);
    });
}
