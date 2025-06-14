#[test_only]
module monster_hunter::map_test;
use sui::test_scenario;
use monster_hunter::map_system;
use monster_hunter::monster_hunter_init_test;
use sui::random;
use sui::random::Random;

#[test]
public fun register(){
      let sender = @0xA;
      let mut scenario = test_scenario::begin(sender);
      let mut dapp_hub = monster_hunter_init_test::deploy_dapp_for_testing(&mut scenario);

      let ctx = test_scenario::ctx(&mut scenario);
      map_system::register(&mut dapp_hub, 0, 0, ctx);


      dapp_hub.destroy();
      scenario.end();
}

//     #[test]
//     #[expected_failure]
//     public fun move_position1(){
//       let sender = @0x0;
//       let mut scenario = test_scenario::begin(sender);
//       let mut dapp_hub = monster_hunter_init_test::deploy_dapp_for_testing(&mut scenario);
//         {
//             random::create_for_testing(scenario.ctx());
//             scenario.next_tx(@0xA);
//         };
//         let random = scenario.take_shared<Random>();
//         // 23140719614837502849299678247283568217
//         // 265323129722700274815559996314403104838
//         // 167645769845140257622894197850400210971
//         // 337352614844298231097611607824428697695
//         // 143043683458825263308720013747056599257
//         // 97853292883519077516783190366887388411
//         // 226059294092153697833364734032968362880

//         let ctx = test_scenario::ctx(&mut scenario);
//         map_system::register(&mut dapp_hub, 0, 1, ctx);

//         map_system::move_position(&mut dapp_hub, &random, monster_hunter_direction::new_east(), ctx);
//         assert!(dapp_hub.position()[ctx.sender()] == monster_hunter_position::new(1, 1));

//         map_system::move_position(&mut dapp_hub, &random, monster_hunter_direction::new_east(), ctx);
//         assert!(dapp_hub.position()[ctx.sender()] == monster_hunter_position::new(2, 1));
//         let expect_monster_address = @0xaa5854249f55f5992873c084541ac3731edf6bce7af20ff5349938511c84e06a;
//         let expect_monster_type = monster_hunter::monster_type::new_rat();
//         assert!(dapp_hub.monster().get(expect_monster_address) == expect_monster_type);
//         assert!(dapp_hub.encounter().get(ctx.sender()) == monster_hunter::monster_hunter_encounter_info::new(expect_monster_address, 0));

//         // Cannot move during an encounter
//         map_system::move_position(&mut dapp_hub, &random, monster_hunter_direction::new_south(), ctx);

//         test_scenario::return_shared(random);
//         test_scenario::return_shared(dapp_hub);
//         dapp.distroy_dapp_for_testing();
//         scenario.end();
//     }

//     #[test]
//     #[expected_failure(abort_code = monster_hunter::errors::SpaceObstructed)]
//     public fun move_position2(){
//         let (mut scenario, dapp) = init_test::deploy_dapp_for_testing(@0x0);
//         {
//             random::create_for_testing(scenario.ctx());
//             scenario.next_tx(@0xA);
//         };

//         let mut dapp_hub = test_scenario::take_shared<dapp_hub>(&scenario);
//         let random = test_scenario::take_shared<Random>(&scenario);

//         let ctx = test_scenario::ctx(&mut scenario);
//         map_system::register(&mut dapp_hub, 2, 5, ctx);

//         let terrains: vector<vector<TerrainType>> = dapp_hub.map_config().get().get_terrain();
//         // y = 5, x = 3 => TerrainType::Boulder
//         assert!(terrains[5][3] == monster_hunter::terrain_type::new_boulder());
//         // Cannot move during an encounter
//         map_system::move_position(&mut dapp_hub, &random, monster_hunter_direction::new_east(), ctx);

//         test_scenario::return_shared(random);
//         test_scenario::return_shared(dapp_hub);
//         dapp.distroy_dapp_for_testing();
//         scenario.end();
//     }
}