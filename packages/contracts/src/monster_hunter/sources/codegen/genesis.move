#[allow(lint(share_owned))]module monster_hunter::monster_hunter_genesis {

  use std::ascii::string;

  use sui::clock::Clock;

  use dubhe::dapp_hub::DappHub;

  use monster_hunter::monster_hunter_dapp_key;

  use monster_hunter::monster_hunter_player;

  use monster_hunter::monster_hunter_moveable;

  use monster_hunter::monster_hunter_obstruction;

  use monster_hunter::monster_hunter_position;

  use monster_hunter::monster_hunter_map_config;

  use monster_hunter::monster_hunter_encounterable;

  use monster_hunter::monster_hunter_encounter_trigger;

  use monster_hunter::monster_hunter_encounter;

  use monster_hunter::monster_hunter_monster;

  use monster_hunter::monster_hunter_owned_by;

  use monster_hunter::monster_hunter_monster_catch_attempt;

  public entry fun run(dapp_hub: &mut DappHub, clock: &Clock, ctx: &mut TxContext) {
    // Create Dapp
    let dapp_key = monster_hunter_dapp_key::new();
    dapp_hub.create_dapp(dapp_key, b"monster_hunter", b"monster_hunter contract", clock, ctx);
    // Register tables
    monster_hunter_player::register_table(dapp_hub, ctx);
    monster_hunter_moveable::register_table(dapp_hub, ctx);
    monster_hunter_obstruction::register_table(dapp_hub, ctx);
    monster_hunter_position::register_table(dapp_hub, ctx);
    monster_hunter_map_config::register_table(dapp_hub, ctx);
    monster_hunter_encounterable::register_table(dapp_hub, ctx);
    monster_hunter_encounter_trigger::register_table(dapp_hub, ctx);
    monster_hunter_encounter::register_table(dapp_hub, ctx);
    monster_hunter_monster::register_table(dapp_hub, ctx);
    monster_hunter_owned_by::register_table(dapp_hub, ctx);
    monster_hunter_monster_catch_attempt::register_table(dapp_hub, ctx);
    // Logic that needs to be automated once the contract is deployed
    monster_hunter::monster_hunter_deploy_hook::run(dapp_hub, ctx);
  }
}
