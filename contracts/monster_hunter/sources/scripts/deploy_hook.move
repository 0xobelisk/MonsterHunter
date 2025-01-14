#[allow(lint(share_owned), unused_let_mut)]module monster_hunter::deploy_hook {

  use std::ascii::string;

  use sui::clock::Clock;

  use monster_hunter::dapp_system;

  use monster_hunter::entity_schema::Entity;

  use monster_hunter::map_schema::Map;

  use monster_hunter::encounter_schema::Encounter;

  public entry fun run(clock: &Clock, ctx: &mut TxContext) {
    // Create a dapp.
    let mut dapp = dapp_system::create(string(b"monster_hunter"),string(b"monster_hunter contract"), clock , ctx);
    // Create schemas
    let mut entity = monster_hunter::entity_schema::create(ctx);
    let mut map = monster_hunter::map_schema::create(ctx);
    let mut encounter = monster_hunter::encounter_schema::create(ctx);
    // Logic that needs to be automated once the contract is deployed
    {
			let  o = monster_hunter::terrain_type::new_none();
            let  t = monster_hunter::terrain_type::new_tall_grass();
            let  b = monster_hunter::terrain_type::new_boulder();
			let terrains = vector[
             vector [t, o, o, o, o, o, t, o, o, o],
             vector [t, t, t, o, o, o, o, o, o, o],
             vector [t, t, t, t, o, o, o, o, b, o],
             vector [o, o, t, t, o, o, o, o, o, o],
             vector [o, b, b, o, o, o, o, o, o, o],
             vector [o, o, o, b, b, o, o, o, o, t],
             vector [t, t, o, o, o, o, o, t, o, b],
             vector [t, o, o, o, o, t, t, t, o, b],
             vector [o, o, o, o, o, t, t, t, o, b],
             vector [o, o, o, b, o, o, t, t, o, b],
            ];

        let height = terrains.length();
        let width = terrains[0].length();
        let x: u64 = 0;
        let y: u64 = 0;

        map.config().set(monster_hunter::map_config::new(width, height, terrains));

        y.range_do!(height, |y| {
            x.range_do!(width, |x| {
                let terrain = terrains[y][x];
                let entity_key = monster_hunter::map_system::position_to_address(x, y);
                let position = monster_hunter::position::new(x, y);
                map.position().set(entity_key, position);
                // std::debug::print(&position);
                // std::debug::print(&terrain);
                if (terrain == monster_hunter::terrain_type::new_none()) {
                    entity.obstruction().set(entity_key, false);
                    entity.encounterable().set(entity_key, false);
                    entity.moveable().set(entity_key, false);
                    encounter.trigger().set(entity_key, false);
                } else if (terrain == monster_hunter::terrain_type::new_boulder()) {
                    entity.obstruction().set(entity_key, true);
                    entity.encounterable().set(entity_key, false);
                    entity.moveable().set(entity_key, false);
                    encounter.trigger().set(entity_key, false);
                } else if (terrain == monster_hunter::terrain_type::new_tall_grass()) {
                    entity.obstruction().set(entity_key, false);
                    entity.encounterable().set(entity_key, false);
                    entity.moveable().set(entity_key, false);
                    encounter.trigger().set(entity_key, true);
                }
            });
        });
			};
    // Authorize schemas and public share objects
    dapp.add_schema<Entity>(entity, ctx);
    dapp.add_schema<Map>(map, ctx);
    dapp.add_schema<Encounter>(encounter, ctx);
    sui::transfer::public_share_object(dapp);
  }
}
