import {DevInspectResults, getMetadata, Obelisk, TransactionBlock, BCS, getSuiMoveConfig} from "@0xobelisk/client";
import {useEffect, useState} from "react";
import { Map, Dialog, PVPModal } from "../../components";
import {Value} from "../../jotai";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from 'react-redux';
import {NETWORK, PACKAGE_ID, WORLD_ID} from "../../chain/config";
import {obeliskConfig} from "../../../obelisk.config";
import PRIVATEKEY from "../../chain/key";
import { setHero, setMapData, setContractMetadata, setMonster, setOwnedMonster } from "../../store/actions"

const Home = () =>{
  let dispatch = useDispatch();
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    // const [contractMetadata, setContractMetadata] = useState()
    const rpgworld = async () => {
        const metadata = await getMetadata(NETWORK, PACKAGE_ID);
        // setContractMetadata(metadata)
        dispatch(setContractMetadata(metadata))
        const obelisk = new Obelisk({
            networkType: NETWORK,
            packageId: PACKAGE_ID,
            metadata: metadata,
            secretKey:PRIVATEKEY
        });

        
        console.log(obelisk.getAddress());
        let player_data = []

        let have_player = await obelisk.containEntity(WORLD_ID, 'position', obelisk.getAddress());
        if (have_player === undefined) {
          alert("Fetch sui api error!")
        } else {
          if (have_player === false) {
            const tx = new TransactionBlock()
            const params = [
              tx.pure(WORLD_ID),
              tx.pure(0),
              tx.pure(0),
            ]
            await obelisk.tx.rpg_system.register(tx, params)
          } else {
            player_data = await obelisk.getEntity(WORLD_ID, 'position', obelisk.getAddress())
          }
        }


        const map_data = await obelisk.getEntity(WORLD_ID, 'map')
        console.log(map_data)
        console.log(WORLD_ID)
        console.log(obelisk.getAddress())
        // const encounter_contain = await obelisk.query.encounter_comp.contains(new_tx, new_params) as DevInspectResults;

        const owned_monsters = await obelisk.getEntity(WORLD_ID, "owned_monsters", obelisk.getAddress())
        console.log(owned_monsters)
        if (owned_monsters !== undefined) {
          dispatch(setOwnedMonster(
            owned_monsters
          ))
        }

        const encounter_contain = await obelisk.containEntity(WORLD_ID, "encounter", obelisk.getAddress())

        
        console.log(JSON.stringify(player_data))
        const stepLength = 2.5;
        dispatch(setHero({
          name: obelisk.getAddress(),
          position: { left: player_data[0] * stepLength, top: player_data[1] * stepLength },
          lock: encounter_contain!
        }))
        dispatch(setMonster({
          exist: encounter_contain!
        }))

        dispatch(setMapData({map: map_data[2], type: "green",
        ele_description: {
          walkable: [0, 39],
          green: [0],
          tussock: [20],
          flower: [22],
          house_land: [23],

          ground_top_1: [30],
          ground_top_2: [31],
          ground_top_3: [32],
          ground_middle_1: [33],
          ground_middle_2: [34],
          ground_middle_3: [35],
          ground_bottom_1: [36],
          ground_bottom_2: [37],
          ground_bottom_3: [38],
          
          object: [40],
          sprite: [41],
          old_man: [43],
          fat_man: [44],
    
          water_top_1: [60],
          water_top_2: [61],
          water_top_3: [62],
          water_middle_1: [63],
          water_middle_2: [64],
          water_middle_3: [65],
          water_bottom_1: [66],
          water_bottom_2: [67],
          water_bottom_3: [68],
          
          obelisk_top: [70],
          obelisk_middle_1: [71],
          obelisk_middle_2: [72],
          obelisk_bottom: [73],
          obelisk_bottom_left: [74],
          obelisk_bottom_right: [75],
    
          tree_top: [80],
          tree_bottom: [81],
          small_tree: [83],
          rocks: [84],
    
          big_house_1: [100],
          big_house_2: [101],
          big_house_3: [102],
          big_house_4: [103],
          big_house_5: [104],
          big_house_6: [105],
          big_house_7: [106],
          big_house_8: [107],
          big_house_9: [108],
          big_house_10: [109],
          big_house_11: [110],
          big_house_12: [111],
          big_house_13: [112],
          big_house_14: [113],
          big_house_15: [114],
          big_house_16: [115],
          big_house_17: [116],
          big_house_18: [117],
          big_house_19: [118],
          big_house_20: [119],
          big_house_21: [120],
          big_house_22: [121],
          big_house_23: [122],
          big_house_24: [123],
          big_house_25: [124],
          big_house_26: [125],
          big_house_27: [126],
          big_house_28: [127],
          big_house_29: [128],
          big_house_30: [129],
          big_house_31: [130],
          big_house_32: [131],
          big_house_33: [132],
          big_house_34: [133],
          big_house_35: [134],
    
    
          small_house_1: [135],
          small_house_2: [136],
          small_house_3: [137],
          small_house_4: [138],
          small_house_5: [139],
          small_house_6: [140],
          small_house_7: [141],
          small_house_8: [142],
          small_house_9: [143],
          small_house_10: [144],
          small_house_11: [145],
          small_house_12: [146],
          small_house_13: [147],
          small_house_14: [148],
          small_house_15: [149],
          small_house_16: [150],
          small_house_17: [151],
          small_house_18: [152],
          small_house_19: [153],
          small_house_20: [154],
          small_house_21: [155],
          small_house_22: [156],
          small_house_23: [157],
          small_house_24: [158],
          small_house_25: [159],
    
          house_stree: [161],
        },
        events: [],
        map_type: "event",}))
        setIsLoading(true)
    }

    useEffect(() => {
        if (router.isReady){
          rpgworld()
        }
    }, [router.isReady]);

    const ownedMonster = useSelector(state => state["ownedMonster"])
    console.log(ownedMonster)
    if (isLoading) {

      return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
        <div style={{minHeight: '1px', display: 'flex', marginBottom: '20px', position: 'relative'}}>
          <Map />
          {/* <!-- Inputs --> */}
          <div style={{ width: 'calc(20vw - 1rem)', maxHeight: '100vh', marginLeft: '10px'}}>
            {/* { page === 1 && 
              <>
                <GenMap />
                <ViewMap />
                <Alert />
              </>
            } */}
            {/* { page === 2 && */}
              <>
              </>
            {/* } */}
          </div>
        </div>
      <Dialog />
      <PVPModal />
      {/* <audio preload="auto" autoPlay loop>     
        <source src="/assets/music/home.mp3" type="audio/mpeg" />
      </audio> */}
      <div className="mx-2 my-2 bg-white text-black">

      {ownedMonster.map((data, index) => {
        return (
          <>
          <div>
            {`Monster-${index}: ${data}`}
          </div>
          </>
          )
      })}
      </div>
      </div>
    )
    } else {
      <></>
    }
}

export default Home


