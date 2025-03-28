#[allow(lint(share_owned), unused_let_mut)]module monster_hunter::monster_hunter_deploy_hook {
  use monster_hunter::monster_hunter_schema::Schema;

  public entry fun run(schema: &mut Schema, _ctx: &mut TxContext) {

			let  o = monster_hunter::monster_hunter_terrain_type::new_none();
            let  t = monster_hunter::monster_hunter_terrain_type::new_tall_grass();
            let  b = monster_hunter::monster_hunter_terrain_type::new_boulder();
			let terrains = vector[
                vector [o, o, o, o, o, o, t, o, o, o, o, o, o, o, o],
                vector [o, o, t, o, o, o, o, o, t, o, o, o, o, b, o],
                vector [o, t, t, t, t, o, o, o, o, o, o, o, o, o, o],
                vector [o, o, t, t, t, t, o, o, o, o, b, o, o, o, o],
                vector [o, o, o, o, t, t, o, o, o, o, o, o, o, o, o],
                vector [o, o, o, b, b, o, o, o, o, o, o, o, o, o, o],
                vector [o, t, o, o, o, b, b, o, o, o, o, t, o, o, o],
                vector [o, o, t, t, o, o, o, o, o, t, o, b, o, o, t],
                vector [o, o, t, o, o, o, o, t, t, t, o, b, b, o, o],
                vector [o, o, o, o, o, o, o, t, t, t, o, b, t, o, t],
                vector [o, b, o, o, o, b, o, o, t, t, o, b, o, o, t],
                vector [o, o, b, o, o, o, t, o, t, t, o, o, b, t, t],
                vector [o, o, b, o, o, o, t, o, t, t, o, o, b, t, t],
            ];

        let height = terrains.length();
        let width = terrains[0].length();
        let x: u64 = 0;
        let y: u64 = 0;

        schema.map_config().set(monster_hunter::monster_hunter_map_config::new(width, height, terrains));

        y.range_do!(height, |y| {
            x.range_do!(width, |x| {
                let terrain = terrains[y][x];
                let position = monster_hunter::monster_hunter_position::new(x, y);
                if (terrain == monster_hunter::monster_hunter_terrain_type::new_boulder()) {
                    schema.obstruction().set(position, true);
                } else if (terrain == monster_hunter::monster_hunter_terrain_type::new_tall_grass()) {
                    schema.encounter_trigger().set(position, true);
                }
            });
        });
  }
}
