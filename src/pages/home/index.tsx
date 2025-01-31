import { loadMetadata, Dubhe, Transaction, TransactionResult } from '@0xobelisk/sui-client';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Map, DialogModal, PVPModal } from '../../components';
import { MapData, ContractMetadata, Monster, OwnedMonster, Hero, SendTxLog } from '../../state';
import { useRouter } from 'next/router';
import { SCHEMA_ID, NETWORK, PACKAGE_ID } from '../../chain/config';
import { dubheConfig } from '../../../dubhe.config';
// import { PRIVATEKEY } from '../../chain/key';
import { ConnectButton, useCurrentWallet, useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';
import { AllPlayers } from '../../state';

const Home = () => {
  const router = useRouter();

  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { connectionStatus } = useCurrentWallet();
  const signerAddress = useCurrentAccount()?.address;

  const [isLoading, setIsLoading] = useState(false);
  const [mapData, setMapData] = useAtom(MapData);
  const [contractMetadata, setContractMetadata] = useAtom(ContractMetadata);
  const [monster, setMonster] = useAtom(Monster);
  const [sendTxLog, setSendTxLog] = useAtom(SendTxLog);
  const [ownedMonster, setOwnedMonster] = useAtom(OwnedMonster);
  const [hero, setHero] = useAtom(Hero);
  const [subscription, setSubscription] = useState<WebSocket | null>(null);
  const [subscriptionCatch, setSubscriptionCatch] = useState<WebSocket | null>(null);
  const [allPlayers, setAllPlayers] = useAtom(AllPlayers);

  const subscribeToEvents = async (dubhe: Dubhe) => {
    const catchResult = {
      Caught: 'Catch monster successed!',
      Fled: 'Monster got away.',
      Missed: 'Catch miss',
    };

    try {
      const allPlayers = await dubhe.getStorage({
        name: 'player',
      });
      const sub = await dubhe.subscribe(['position', 'monster_info', 'monster_catch_attempt_event', 'player'], data => {
        console.log('Received real-time data:', data);
        if (data.name === 'position') {
          const stepLength = 2.5;
          const position = data.value;
          const playerAddress = data.key1;

          setHero(prev => ({
            ...prev,
            position: {
              left: position.x * stepLength,
              top: position.y * stepLength,
            },
          }));

          if (allPlayers.data.find(p => p.key1 === playerAddress)) {
            setAllPlayers(prev => {
              const newPlayers = [...prev];
              const playerIndex = newPlayers.findIndex(p => p.address === playerAddress);

              if (playerIndex > -1) {
                newPlayers[playerIndex].position = {
                  left: position.x * stepLength,
                  top: position.y * stepLength,
                };
              } else {
                newPlayers.push({
                  address: playerAddress,
                  position: {
                    left: position.x * stepLength,
                    top: position.y * stepLength,
                  },
                });
              }

              return newPlayers;
            });
          }
        } else if (data.name === 'monster_info') {
          console.log('======== indexer monster_info ========');
          console.log(data);
          const shouldLock = !!data.value;
          setMonster({
            exist: shouldLock,
          });
          setHero(prev => ({
            ...prev,
            lock: shouldLock,
          }));

          if (shouldLock) {
            setSendTxLog({
              display: true,
              content: 'Have monster',
              yesContent: 'Throw',
              noContent: 'Run',
            });
          } else if (data.value === null) {
            setSendTxLog(prev => ({ ...prev, display: false }));
          }
        } else if (data.name === 'monster_catch_attempt_event') {
          console.log('======== indexer monster_catch_attempt_event ========');
          console.log(data);
          console.log(Object.keys(data.value.result));
          toast('Monster catch attempt event received', {
            description: `Result: ${catchResult[Object.keys(data.value.result)[0]]}`,
          });

          if (!data.value.result.Missed) {
            setSendTxLog(prev => ({ ...prev, display: false }));
            setMonster({
              exist: false,
            });
            setHero(prev => ({
              ...prev,
              lock: false,
            }));
          }
        }
      });
      setSubscription(sub);
    } catch (error) {
      console.error('Failed to subscribe to events:', error);
    }
  };

  const initializeGameState = async (dubhe: Dubhe) => {
    try {
      let have_player = await dubhe.getStorageItem({
        name: 'player',
        key1: signerAddress,
      });
      console.log('======== v1 have_player ========');
      console.log(have_player);
      if (have_player === undefined) {
        const registerTx = new Transaction();
        const params = [registerTx.object(SCHEMA_ID), registerTx.pure.u64(0), registerTx.pure.u64(0)];
        registerTx.setGasBudget(100000000);
        await dubhe.tx.map_system.register({
          tx: registerTx,
          params,
          isRaw: true,
        });
        const { digest } = await signAndExecuteTransaction(
          {
            transaction: registerTx.serialize(),
            chain: `sui:${NETWORK}`,
          },
          {
            onSuccess: async result => {
              setTimeout(async () => {
                toast('Register Successful', {
                  description: new Date().toUTCString(),
                  action: {
                    label: 'Check in Explorer',
                    onClick: () => window.open(dubhe.getTxExplorerUrl(result.digest), '_blank'),
                  },
                });
              }, 2000);
            },
            onError: error => {
              console.error('Transaction failed:', error);
              toast.error('Transaction failed. Please try again.');
            },
          },
        );
        await dubhe.waitForTransaction(digest);
      }
      console.log('======== v1 end ========');
      let player_data = await dubhe.getStorageItem({
        name: 'position',
        key1: signerAddress,
      });
      console.log('======== v1 player_data ========');
      console.log('player_data structure:', player_data);
      console.log(player_data);

      const entityMonsterTx = new Transaction();
      const owned_monsters = await dubhe.state({
        tx: entityMonsterTx,
        schema: 'monster',
        params: [entityMonsterTx.object(SCHEMA_ID), entityMonsterTx.pure.address(signerAddress)],
      });
      if (owned_monsters !== undefined) {
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
        position: {
          left: (player_data && player_data.value.x ? player_data.value.x : 0) * stepLength,
          top: (player_data && player_data.value.y ? player_data.value.y : 0) * stepLength,
        },
        lock: encounter_contain!,
      });
      setMonster({
        exist: encounter_contain!,
      });
      if (encounter_contain) {
        setSendTxLog({
          display: true,
          content: 'Have monster',
          yesContent: 'Throw',
          noContent: 'Run',
        });
      }

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

      const allPlayers = await dubhe.getStorage({
        name: 'player',
      });

      let userPositionList = [];
      for (const player of allPlayers.data) {
        const userPosition = await dubhe.getStorageItem({
          name: 'position',
          key1: player.key1,
        });
        userPositionList.push(userPosition);
      }

      console.log(userPositionList);
      userPositionList.forEach(position => {
        setAllPlayers(prev => {
          const newPlayers = [...prev];
          const playerIndex = newPlayers.findIndex(p => p.address === position.data.key1);

          if (playerIndex > -1) {
            newPlayers[playerIndex].position = {
              left: position.value.x * stepLength,
              top: position.value.y * stepLength,
            };
          } else {
            console.log('======== v1 newPlayers ========');
            console.log({
              address: position.data.key1,
              position: {
                left: position.value.x * stepLength,
                top: position.value.y * stepLength,
              },
            });
            newPlayers.push({
              address: position.data.key1,
              position: {
                left: position.value.x * stepLength,
                top: position.value.y * stepLength,
              },
            });
          }
          return newPlayers;
        });
      });
    } catch (error) {
      console.error('Failed to initialize game state:', error);
      toast.error('Failed to load initial game state');

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

  const rpgworld = async () => {
    const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
    setContractMetadata(metadata);
    const dubhe = new Dubhe({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: metadata,
    });
    await initializeGameState(dubhe);
    // await subscribeToEvents(dubhe);
    // await subscribeToEventsCatch(dubhe);
    setIsLoading(true);
  };

  useEffect(() => {
    if (router.isReady && connectionStatus === 'connected' && signerAddress) {
      console.log(1);
      rpgworld();
    }
  }, [router.isReady, connectionStatus, signerAddress]);

  useEffect(() => {
    if (signerAddress) {
      const dubhe = new Dubhe({
        networkType: NETWORK,
        packageId: PACKAGE_ID,
        metadata: contractMetadata,
      });

      initializeGameState(dubhe);

      subscribeToEvents(dubhe);
      // subscribeToEventsCatch(dubhe);
      return () => {
        if (subscription) {
          subscription.close();
        }
        if (subscriptionCatch) {
          subscriptionCatch.close();
        }
      };
    }
  }, [signerAddress]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ minHeight: '1px', display: 'flex', marginBottom: '20px', position: 'relative' }}>
          <Map />
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
  } else {
    return (
      <div>
        <ConnectButton>Connect Wallet</ConnectButton>
      </div>
    );
  }
};

export default Home;
