module monster_hunter::map_system {
    use monster_hunter::schema::Schema;
    use sui::bcs;
    use monster_hunter::monster_info;
    use sui::address;
    use sui::random::{Random, RandomGenerator};
    use sui::random;
    use monster_hunter::direction;
    use monster_hunter::direction::Direction;
    use monster_hunter::errors::{not_registered_error, cannot_move_error, space_obstructed_error, already_registered_error};
    use monster_hunter::position;
    use monster_hunter::monster_type;

    public fun register(schema: &mut Schema,  x: u64, y: u64, ctx: &mut TxContext) {
        let player = ctx.sender();
        already_registered_error(!schema.player().contains(player));
        // Constrain position to map size, wrapping around if necessary
        let (width, height, _) = schema.map_config()[].get();
        let x = (x + width) % width;
        let y = (y + height) % height;

        let space_addr = position_to_address(x, y);
        space_obstructed_error(!schema.obstruction()[space_addr]);

        schema.player().set(player, true);
        schema.moveable().set(player, true);
        schema.encounterable().set(player, true);
        schema.owned_by().set(player, vector[]);
        schema.position().set(player, position::new(x, y));
    }


    fun start_encounter(schema: &mut Schema, generator: &mut RandomGenerator, player: address) {
        let monster = random::generate_u256(generator);
        let mut monster_type = monster_type::new_none();
        if (monster % 4 == 1) {
            monster_type = monster_type::new_eagle();
        } else if (monster % 4 == 2) {
            monster_type = monster_type::new_rat();
        } else if (monster % 4 == 3) {
            monster_type = monster_type::new_caterpillar();
        };

        let monster = address::from_u256(monster);
        schema.monster().set(monster, monster_type);
        let monster_info = monster_info::new(monster, 0);
        schema.monster_info().set(player, monster_info);
    }

    public fun move_position(schema: &mut Schema, random: &Random, direction: Direction, ctx: &mut TxContext) {
        let player = ctx.sender();
        not_registered_error(schema.moveable().contains(player));
        cannot_move_error(schema.moveable()[player]);
        // Cannot move during an encounter
        cannot_move_error(!schema.monster_info().contains(player));

        let (mut x, mut y) = schema.position().get(player).get();
        if (direction == direction::new_north()) {
            y = y - 1;
        } else if (direction == direction::new_east()) {
            x = x + 1;
        } else if (direction == direction::new_south()) {
            y = y + 1;
        } else if (direction == direction::new_west()) {
            x = x - 1;
        };

        // Constrain position to map size, wrapping around if necessary
        let (width, height, _) = schema.map_config()[].get();
        let x = (x + width) % width;
        let y = (y + height) % height;

        let space_addr = position_to_address(x, y);
        space_obstructed_error(!schema.obstruction()[space_addr]);

        schema.position().set(player, position::new(x, y));

        let mut generator = random::new_generator(random, ctx);
        let rand = random::generate_u128(&mut generator);
        // std::debug::print(&rand);

        if(schema.player()[player] && schema.encounter_trigger()[space_addr]) {
            if (rand % 5 == 0) {
                start_encounter(schema, &mut generator, player);
            }
        }
    }

    public fun position_to_address(x: u64, y: u64): address {
        let mut x = bcs::to_bytes(&(x as u128));
        let y = bcs::to_bytes(&(y as u128));
        x.append(y);
        address::from_bytes(x)
    }
}
