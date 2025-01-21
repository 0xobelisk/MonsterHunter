// #[test_only]
// module monster_hunter::encounter_test {
//     use std::debug;
//     use sui::random::Random;
//     use sui::random;
//     use sui::test_scenario;
//     use monster_hunter::map_system;
//     use monster_hunter::encounter_system;
//     use monster_hunter::direction;
//     use monster_hunter::init_test;
//     use monster_hunter::schema::Schema;
//
//     #[test]
//     public fun throw_ball(){
//         let (mut scenario, dapp) = init_test::deploy_dapp_for_testing(@0x0);
//         {
//             random::create_for_testing(scenario.ctx());
//             scenario.next_tx(@0xA);
//         };
//
//         let mut schema = test_scenario::take_shared<Schema>(&scenario);
//         let random = test_scenario::take_shared<Random>(&scenario);
//
//         let ctx = test_scenario::ctx(&mut scenario);
//         map_system::register(&mut schema, 0, 0, ctx);
//         map_system::move_position(&mut schema, &random, direction::new_east(), ctx);
//         map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
//         map_system::move_position(&mut schema, &random, direction::new_east(), ctx);
//         map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
//
//         // Cannot move during an encounter
//         let monster_info = schema.monster_info()[ctx.sender()];
//         assert!(schema.monster_info().get(ctx.sender()).get_catch_attempts() == 0);
//         encounter_system::throw_ball(&mut schema, &random, ctx);
//         assert!(schema.monster_info().get(ctx.sender()).get_catch_attempts() == 1);
//         encounter_system::throw_ball(&mut schema, &random, ctx);
//         assert!(schema.monster_info().get(ctx.sender()).get_catch_attempts() == 2);
//         encounter_system::throw_ball(&mut schema, &random, ctx);
//
//         assert!(schema.monster_info().contains(ctx.sender()) == false);
//         assert!(schema.owned_by()[ctx.sender()] == vector[monster_info.get_monster()]);
//
//         map_system::move_position(&mut schema, &random, direction::new_east(), ctx);
//         map_system::move_position(&mut schema, &random, direction::new_east(), ctx);
//         map_system::move_position(&mut schema, &random, direction::new_west(), ctx);
//         map_system::move_position(&mut schema, &random, direction::new_east(), ctx);
//         map_system::move_position(&mut schema, &random, direction::new_west(), ctx);
//
//         encounter_system::throw_ball(&mut schema, &random, ctx);
//         let monsters = schema.owned_by()[ctx.sender()];
//         debug::print(schema.monster().get(monsters[0]));
//         debug::print(schema.monster().get(monsters[1]));
//
//         test_scenario::return_shared(random);
//         test_scenario::return_shared(schema);
//
//         dapp.distroy_dapp_for_testing();
//         scenario.end();
//     }
//
//     #[test]
//     public fun flee(){
//         let (mut scenario, dapp) = init_test::deploy_dapp_for_testing(@0x0);
//         {
//             random::create_for_testing(scenario.ctx());
//             scenario.next_tx(@0xA);
//         };
//
//         let mut schema = test_scenario::take_shared<Schema>(&scenario);
//         let random = test_scenario::take_shared<Random>(&scenario);
//
//         let ctx = test_scenario::ctx(&mut scenario);
//         map_system::register(&mut schema, 0, 0, ctx);
//         map_system::move_position(&mut schema, &random, direction::new_east(), ctx);
//         map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
//         map_system::move_position(&mut schema, &random, direction::new_east(), ctx);
//         map_system::move_position(&mut schema, &random, direction::new_south(), ctx);
//
//         // Cannot move during an encounter
//         let monster_info = schema.monster_info()[ctx.sender()];
//         assert!(schema.monster_info().get(ctx.sender()).get_catch_attempts() == 0);
//         encounter_system::throw_ball(&mut schema, &random, ctx);
//         assert!(schema.monster_info().get(ctx.sender()).get_catch_attempts() == 1);
//         debug::print(schema.owned_by().get(ctx.sender()));
//
//         encounter_system::flee(&mut schema, ctx);
//
//         assert!(schema.monster_info().contains(ctx.sender()) == false);
//         assert!(schema.owned_by()[ctx.sender()] == vector[]);
//         assert!(schema.monster().contains(monster_info.get_monster()) == false);
//
//         test_scenario::return_shared(random);
//         test_scenario::return_shared(schema);
//         dapp.distroy_dapp_for_testing();
//         scenario.end();
//     }
// }