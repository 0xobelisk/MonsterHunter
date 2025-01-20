#[test_only]
module monster_hunter::map_test {
    use std::debug;
    use monster_hunter::schema::Schema;
    use monster_hunter::position;
    use sui::random::Random;
    use sui::random;
    use sui::test_scenario;
    use monster_hunter::map_system;
    use monster_hunter::direction;
    use monster_hunter::init_test;

    #[test]
    public fun register(){
       let (mut scenario, dapp) = init_test::deploy_dapp_for_testing(@0xA);
        let mut schema = test_scenario::take_shared<Schema>(&scenario);

        let ctx = test_scenario::ctx(&mut scenario);
        map_system::register(&mut schema, 0, 0, ctx);

        assert!(schema.player().contains(ctx.sender()));
        assert!(schema.moveable().contains(ctx.sender()));
        assert!(schema.encounterable().contains(ctx.sender()));
        assert!(schema.position().contains(ctx.sender()));

        test_scenario::return_shared(schema);
        dapp.distroy_dapp_for_testing();
        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = monster_hunter::cannot_move_error::CannotMove)]
    public fun move_position1(){
        let (mut scenario, dapp) = init_test::deploy_dapp_for_testing(@0x0);
        {
            random::create_for_testing(scenario.ctx());
            scenario.next_tx(@0xA);
        };
        let mut schema = test_scenario::take_shared<Schema>(&scenario);
        let random = test_scenario::take_shared<Random>(&scenario);

        let ctx = test_scenario::ctx(&mut scenario);
        map_system::register(&mut schema, 0, 0, ctx);

        map_system::move_position(&mut schema, &random, direction::new_east(), ctx);
        assert!(schema.position()[ctx.sender()] == position::new(1, 0));

        map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
        assert!(schema.position()[ctx.sender()] == position::new(1, 1));

        map_system::move_position(&mut schema, &random, direction::new_east(), ctx);
        assert!(schema.position()[ctx.sender()] == position::new(2, 1));

        map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
        map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
        map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
        assert!(schema.position()[ctx.sender()] == position::new(2, 4));

        // Cannot move during an encounter
        map_system::move_position(&mut schema, &random, direction::new_south(), ctx);

        test_scenario::return_shared(random);
        test_scenario::return_shared(schema);
        dapp.distroy_dapp_for_testing();
        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = monster_hunter::space_obstructed_error::SpaceObstructed)]
    public fun move_position2(){
        let (mut scenario, dapp) = init_test::deploy_dapp_for_testing(@0x0);
        {
            random::create_for_testing(scenario.ctx());
            scenario.next_tx(@0xA);
        };

        let mut schema = test_scenario::take_shared<Schema>(&scenario);
        let random = test_scenario::take_shared<Random>(&scenario);

        let ctx = test_scenario::ctx(&mut scenario);
        map_system::register(&mut schema, 0, 0, ctx);

        map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
        map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
        map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
        map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
        map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
        assert!(schema.position()[ctx.sender()] == position::new(0, 5));

        map_system::move_position(&mut schema, &random, direction::new_east(), ctx);
        map_system::move_position(&mut schema, &random, direction::new_east(), ctx);
        assert!(schema.position()[ctx.sender()] == position::new(2, 5));

        // // Cannot move during an encounter
        map_system::move_position(&mut schema, &random, direction::new_east(), ctx);
        assert!(schema.position()[ctx.sender()] == position::new(3, 5));

        let terrains = schema.map_config().get().get_terrain();
        debug::print(&terrains[3][5]);

        test_scenario::return_shared(random);
        test_scenario::return_shared(schema);
        dapp.distroy_dapp_for_testing();
        scenario.end();
    }
}