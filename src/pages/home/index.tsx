import { loadMetadata, Dubhe, Transaction, TransactionResult } from '@0xobelisk/sui-client';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Map, DialogModal, PVPModal } from '../../components';
import { MapData, ContractMetadata, Monster, OwnedMonster, Hero, SendTxLog } from '../../state';
import { useRouter } from 'next/router';
import { SCHEMA_ID, NETWORK, PACKAGE_ID } from '../../chain/config';
import { toast } from 'sonner';
import { ADDRESS, PRIVATE_KEY } from 'src/chain/wallet';



const Home = () => {
  const router = useRouter();
  const [,setMapData] = useAtom(MapData);
  const [,setContractMetadata] = useAtom(ContractMetadata);
  const [,setMonster] = useAtom(Monster);
  const [,setSendTxLog] = useAtom(SendTxLog);
  const [,setHero] = useAtom(Hero)
  const [ownedMonster, setOwnedMonster] = useAtom(OwnedMonster);
  const [subscription, setSubscription] = useState<WebSocket | null>(null);
  const [subscriptionCatch, setSubscriptionCatch] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const subscribeToEvents = async (dubhe: Dubhe): Promise<WebSocket> => {
    try {
      const sub = await dubhe.subscribe(['position', 'monster_info'], data => {
        console.log('Received real-time data:', data);
        if (data.name === 'position') {
          const position = data.value.fields;
          setHero(prev => ({
            ...prev,
            position: {
              left: position.x * 2.5,
              top: position.y * 2.5,
            },
          }));
        } else if (data.name === 'monster_info') {
          const shouldLock = !!data.value;
          setMonster({
            exist: shouldLock,
          });
          setHero(prev => ({
            ...prev,
            lock: shouldLock,
          }));
        }
      });
      return sub;
    } catch (error) {
      console.error('Failed to subscribe to events:', error);
      throw error;
    }
  };

  const subscribeToEventsCatch = async (dubhe: Dubhe): Promise<WebSocket> => {
    const catchResult: Record<string, string> = {
      Caught: 'Catch monster successed!',
      Fled: 'Monster got away.',
      Missed: 'Catch miss',
    };

    try {
      const sub = await dubhe.subscribe(['monster_catch_attempt_event'], async data => {
        console.log('Catch monster event:', data);
        
        const result = data.result?.variant || 'Missed';
        
        toast('Monster catch attempt event received', {
          description: `Result: ${catchResult[result] || 'Unknown result'}`,
        });

        if (result !== 'Missed') {
          setSendTxLog(prev => ({ ...prev, display: false }));
          setMonster({ exist: false });
          setHero(prev => ({ ...prev, lock: false }));
        }
      });
      return sub;
    } catch (error) {
      console.error('Failed to subscribe to events:', error);
      throw error;
    }
  };

  const initializeGameState = async (dubhe: Dubhe) => {
    try {
      console.log('Starting initializeGameState...');
      
      const have_player = await dubhe.getStorage({
        name: 'player',
        key1: ADDRESS,
      });
      console.log('Player data:', have_player);

      if (!have_player?.edges?.length) {
        const registerTx = new Transaction();
        const params = [
          registerTx.object(SCHEMA_ID), 
          registerTx.pure.u64(0), 
          registerTx.pure.u64(0)
        ];
        
        registerTx.setGasBudget(100000000);
        
        const result = await dubhe.tx.map_system.register({
          tx: registerTx,
          params,
          isRaw: true,
        }) as TransactionResult;

        if (result?.effects?.status?.status === 'success') {
          setTimeout(() => {
            toast('Register Successful', {
              description: new Date().toUTCString(),
              action: {
                label: 'Check in Explorer',
                onClick: () => window.open(dubhe.getTxExplorerUrl(result.digest), '_blank'),
              },
            });
          }, 2000);

          await dubhe.waitForTransaction(result.digest);
        }
      }

      console.log(dubhe);
      console.log('======== v1 have_player ========');
      console.log(have_player);
      console.log(have_player.edges.length);
      if (have_player.edges.length === 0) { 
        console.log("why?");
        
        const registerTx = new Transaction();
        console.log("why1?");
        const params = [registerTx.object(SCHEMA_ID), registerTx.pure.u64(0), registerTx.pure.u64(0)];
        console.log("why2");
        registerTx.setGasBudget(100000000);
        console.log("why3");
        await dubhe.tx.map_system.register({
          tx: registerTx,
          params,
          isRaw: true,
        });
      const result = await dubhe.signAndSendTxn(registerTx);
      console.log("11111");
      

      if (result.effects.status.status == 'success') {
        console.log('Transaction successful, digest:', result.digest);

        setTimeout(async () => {
          toast('Register Successful', {
            description: new Date().toUTCString(),
            action: {
              label: 'Check in Explorer',
              onClick: () => window.open(dubhe.getTxExplorerUrl(result.digest), '_blank'),
            },
          });
        }, 2000);
      }
        await dubhe.waitForTransaction(result.digest);
      }
      console.log('======== v1 end ========');
      const entityPositionTx = new Transaction();
      let player_data = await dubhe.state({
        tx: entityPositionTx,
        schema: 'position',
        params: [entityPositionTx.object(SCHEMA_ID), entityPositionTx.pure.address(ADDRESS)],
      });
      console.log('======== v1 player_data ========');
      console.log('player_data structure:', player_data);
      console.log(player_data);

      const entityMonsterTx = new Transaction();
      const owned_monsters = await dubhe.state({
        tx: entityMonsterTx,
        schema: 'monster',
        params: [entityMonsterTx.object(SCHEMA_ID), entityMonsterTx.pure.address(ADDRESS)],
      });
      if (owned_monsters !== undefined) {
        setOwnedMonster(owned_monsters[0]);
      }

      const entityEncounterableTx = new Transaction();
      let encounter_contain = false;
      let encounter_contain_data = await dubhe.state({
        tx: entityEncounterableTx,
        schema: 'monster_info',
        params: [entityEncounterableTx.object(SCHEMA_ID), entityEncounterableTx.pure.address(ADDRESS)],
      });
      console.log('======== v1 encounter_contain_data ========');
      console.log(encounter_contain_data);
      if (encounter_contain_data !== undefined) {
        encounter_contain = true;
      }

      console.log(JSON.stringify(player_data));
      const stepLength = 2.5;
      setHero({
        name: ADDRESS,
        position: {
          left: (player_data && player_data[0].x ? player_data[0].x : 0) * stepLength,
          top: (player_data && player_data[0].y ? player_data[0].y : 0) * stepLength,
        },
        lock: encounter_contain!,
      });
      setMonster({
        exist: encounter_contain!,
      });

      const mapConfigTx = new Transaction();
      const map_state = await dubhe.state({
        tx: mapConfigTx,
        schema: 'map_config',
        params: [mapConfigTx.object(SCHEMA_ID)],
      });

      setMapData({
        map: map_state?.[0]?.terrain ?? [],
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
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize game state:', error);
      toast.error('Failed to load initial game state');
      setIsLoading(false);
      
      setMapData({
        map: [],
        type: 'green',
        ele_description: {
          walkable: [],
          green: [],
          tussock: [],
          small_tree: [],
        },
        events: [],
        map_type: 'event',
      });
    }
  };

  const initializeDubhe = async () => {
    try {
      const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
      setContractMetadata(metadata);
      
      const dubhe = new Dubhe({
        networkType: NETWORK,
        packageId: PACKAGE_ID,
        metadata: metadata,
        secretKey: PRIVATE_KEY,
      });

      // Test connection
      await dubhe.getProvider().getLatestCheckpointSequenceNumber();
      
      return dubhe;
    } catch (error) {
      console.error('Dubhe initialization error:', {
        error,
        message: error.message,
        stack: error.stack
      });
      toast.error(`Network connection failed: ${error.message}`);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;
    let dubheInstance: Dubhe | null = null;

    const initialize = async () => {
      if (!ADDRESS) return;

      try {
        dubheInstance = await initializeDubhe();
        if (!mounted) return;

        await initializeGameState(dubheInstance);
        if (!mounted) return;

        const newSubscription = await subscribeToEvents(dubheInstance);
        const newCatchSubscription = await subscribeToEventsCatch(dubheInstance);
        
        if (!mounted) {
          newSubscription?.close();
          newCatchSubscription?.close();
          return;
        }

        setSubscription(newSubscription);
        setSubscriptionCatch(newCatchSubscription);
      } catch (error) {
        console.error('Initialization failed:', error);
        toast.error('Failed to initialize game. Please try refreshing the page.');
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (subscription) subscription.close();
      if (subscriptionCatch) subscriptionCatch.close();
    };
  }, [ADDRESS]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ minHeight: '1px', display: 'flex', marginBottom: '20px', position: 'relative' }}>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Map />
          )}
          <div style={{ width: 'calc(20vw - 1rem)', maxHeight: '100vh', marginLeft: '10px' }}>
            <></>
          </div>
        </div>
        <DialogModal />
        <PVPModal />
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
};

export default Home;
