#[allow(lint(share_owned))]module monster_hunter::monster_hunter_genesis {

  use std::ascii::string;

  use sui::clock::Clock;

  use monster_hunter::monster_hunter_dapp_system;

  public entry fun run(clock: &Clock, ctx: &mut TxContext) {
    // Create schemas
    let mut schema = monster_hunter::monster_hunter_schema::create(ctx);
    // Setup default storage
    monster_hunter_dapp_system::create(&mut schema, string(b"monster_hunter"),string(b"monster_hunter contract"), clock , ctx);
    // Logic that needs to be automated once the contract is deployed
    monster_hunter::monster_hunter_deploy_hook::run(&mut schema, ctx);
    // Authorize schemas and public share objects
    sui::transfer::public_share_object(schema);
  }
}
