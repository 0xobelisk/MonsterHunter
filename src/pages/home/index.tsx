import { loadMetadata, Dubhe, Transaction, TransactionResult } from '@0xobelisk/sui-client';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Map, DialogModal, PVPModal } from '../../components';
import { MapData, ContractMetadata, Monster, OwnedMonster, Hero } from '../../state';
import { useRouter } from 'next/router';
import { SCHEMA_ID, NETWORK, PACKAGE_ID } from '../../chain/config';
import { dubheConfig } from '../../../dubhe.config';
// import { PRIVATEKEY } from '../../chain/key';
import { ConnectButton, useCurrentWallet, useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';

const Home = () => {
  const router = useRouter();

  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { connectionStatus } = useCurrentWallet();
  const signerAddress = useCurrentAccount()?.address;

  const [isLoading, setIsLoading] = useState(false);
  const [mapData, setMapData] = useAtom(MapData);
  const [contractMetadata, setContractMetadata] = useAtom(ContractMetadata);
  const [monster, setMonster] = useAtom(Monster);
  const [ownedMonster, setOwnedMonster] = useAtom(OwnedMonster);
  const [hero, setHero] = useAtom(Hero);
  // const [contractMetadata, setContractMetadata] = useState()
  const rpgworld = async () => {
    const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
    // setContractMetadata(metadata)
    // dispatch(setContractMetadata(metadata))
    setContractMetadata(metadata);
    const dubhe = new Dubhe({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: metadata,
      // secretKey: PRIVATEKEY,
    });
    // const address = wallet.address;
    console.log('======== v1 address ========');
    console.log(signerAddress);

    const entityTx = new Transaction();
    console.log('======== v1 entityTx ========');
    console.log(SCHEMA_ID, signerAddress);
    let have_player = await dubhe.state({
      tx: entityTx,
      schema: 'player',
      params: [entityTx.object(SCHEMA_ID), entityTx.pure.address(signerAddress)],
    });
    console.log('======== v1 have_player ========');
    console.log(have_player);
    if (have_player === undefined || have_player[0] === false) {
      const registerTx = new Transaction();
      const params = [registerTx.object(SCHEMA_ID), registerTx.pure.u64(0), registerTx.pure.u64(0)];
      registerTx.setGasBudget(100000000);
      await dubhe.tx.map_system.register({
        tx: registerTx,
        params,
        isRaw: true,
      });
      await signAndExecuteTransaction(
        {
          transaction: registerTx.serialize(),
          chain: `sui:${NETWORK}`,
        },
        {
          onSuccess: async result => {
            // Wait for a short period before querying the latest data
            setTimeout(async () => {
              toast('Register Successful', {
                description: new Date().toUTCString(),
                action: {
                  label: 'Check in Explorer',
                  onClick: () => window.open(dubhe.getTxExplorerUrl(result.digest), '_blank'),
                },
              });
            }, 2000); // Wait for 2 seconds before querying, adjust as needed
          },
          onError: error => {
            console.error('Transaction failed:', error);
            toast.error('Transaction failed. Please try again.');
          },
        },
      );

      // await obelisk.tx.map_system.register(tx, params);
      //   alert('Fetch sui api error!');
      // } else {
    }
    console.log('======== v1 end ========');
    // let player_data = await obelisk.getEntity(WORLD_ID, 'position', address);
    const entityPositionTx = new Transaction();
    let player_data = (
      await dubhe.state({
        tx: entityPositionTx,
        schema: 'position',
        params: [entityPositionTx.object(SCHEMA_ID), entityPositionTx.pure.address(signerAddress)],
      })
    )[0];
    console.log('======== v1 player_data ========');
    console.log(player_data);

    const mapConfigTx = new Transaction();
    const map_data = (
      await dubhe.state({
        tx: mapConfigTx,
        schema: 'map_config',
        params: [mapConfigTx.object(SCHEMA_ID)],
      })
    )[0];
    console.log('======== map data ========');
    console.log(map_data);
    console.log(signerAddress);
    // const encounter_contain = await obelisk.query.encounter_comp.contains(new_tx, new_params) as DevInspectResults;

    const entityMonsterTx = new Transaction();
    const owned_monsters = await dubhe.state({
      tx: entityMonsterTx,
      schema: 'monster',
      params: [entityMonsterTx.object(SCHEMA_ID), entityMonsterTx.pure.address(signerAddress)],
    });
    if (owned_monsters !== undefined) {
      // dispatch(setOwnedMonster(
      //   owned_monsters
      // ))
      setOwnedMonster(owned_monsters[0]);
    }

    const entityEncounterableTx = new Transaction();
    let encounter_contain = false;
    let encounter_contain_data = await dubhe.state({
      tx: entityEncounterableTx,
      schema: 'monster_info',
      params: [entityEncounterableTx.object(SCHEMA_ID), entityEncounterableTx.pure.address(signerAddress)],
    });
    console.log('======== v1 encounter_contain_data ========');
    console.log(encounter_contain_data);
    if (encounter_contain_data !== undefined) {
      encounter_contain = true;
    }

    console.log(JSON.stringify(player_data));
    const stepLength = 2.5;
    setHero({
      name: signerAddress,
      position: { left: player_data['x'] * stepLength, top: player_data['y'] * stepLength },
      lock: encounter_contain!,
    });
    setMonster({
      exist: encounter_contain!,
    });

    setMapData({
      map: map_data['terrain'],
      type: 'green',
      ele_description: {
        walkable: [
          {
            None: true,
            $kind: 'None',
          },
          {
            TallGrass: true,
            $kind: 'TallGrass',
          },
        ],
        green: [
          {
            None: true,
            $kind: 'None',
          },
        ],
        tussock: [
          {
            TallGrass: true,
            $kind: 'TallGrass',
          },
        ],
        small_tree: [
          {
            Boulder: true,
            $kind: 'Boulder',
          },
        ],
      },
      events: [],
      map_type: 'event',
    });
    setIsLoading(true);
  };

  useEffect(() => {
    if (router.isReady && connectionStatus === 'connected' && signerAddress) {
      console.log(1);
      rpgworld();
    }
  }, [router.isReady, connectionStatus, signerAddress]);

  // const ownedMonster = useSelector(state => state["ownedMonster"])
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ minHeight: '1px', display: 'flex', marginBottom: '20px', position: 'relative' }}>
          <Map />
          {/* <!-- Inputs --> */}
          <div style={{ width: 'calc(20vw - 1rem)', maxHeight: '100vh', marginLeft: '10px' }}>
            {/* { page === 1 &&
              <>
                <GenMap />
                <ViewMap />
                <Alert />
              </>
            } */}
            {/* { page === 2 && */}
            <></>
            {/* } */}
          </div>
        </div>
        <DialogModal />
        <PVPModal />
        {/* <audio preload="auto" autoPlay loop>
        <source src="/assets/music/home.mp3" type="audio/mpeg" />
      </audio> */}
        <div className="mx-2 my-2 bg-white text-black">
          {ownedMonster.map((data, index) => {
            return (
              <>
                <div>{`Monster-${index}: 0x${data}`}</div>
              </>
            );
          })}
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <ConnectButton>Connect Wallet</ConnectButton>
      </div>
    );
  }
};

export default Home;
