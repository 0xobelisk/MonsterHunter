import { DevInspectResults, Dubhe, Transaction } from '@0xobelisk/sui-client';
import { useEffect, useState, useRef, useMemo, ReactElement } from 'react';

import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import {
  MapData,
  ContractMetadata,
  Dialog,
  SendTxLog,
  Hero,
  Monster,
  OwnedMonster,
  TerrainItemType,
  AllPlayers,
} from '../state';
import { NETWORK, PACKAGE_ID, SCHEMA_ID } from '../chain/config';
// import { PRIVATEKEY } from '../chain/key';
import { TransactionResult } from '@0xobelisk/sui-client/src';
import { ConnectButton, useCurrentWallet, useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';

export default function Map() {
  const treasureCount = 2;
  const spriteCount = 5;

  let playerSprites = {
    W: 'assets/player/W.gif',
    S: 'assets/player/S.gif',
    A: 'assets/player/A.gif',
    D: 'assets/player/D.gif',
  };

  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { connectionStatus } = useCurrentWallet();
  const signerAddress = useCurrentAccount()?.address;

  const [heroImg, setHeroImg] = useState(playerSprites['S']);

  let [rowNumber, setRowNumber] = useState(1);
  let [unboxState, setUnboxState] = useState({});
  const mapData = useAtomValue(MapData);
  const contractMetadata = useAtomValue(ContractMetadata);
  const [monster, setMonster] = useAtom(Monster);
  const [ownedMonster, setOwnedMonster] = useAtom(OwnedMonster);
  const [hero, setHero] = useAtom(Hero);
  const setDialog = useSetAtom(Dialog);
  const setSendTxLog = useSetAtom(SendTxLog);

  const [stepTransactions, setStepTransactions] = useState<any[][]>([]);
  const allPlayers = useAtomValue(AllPlayers);

  // fill screen with rows of block
  const calcOriginalMapRowNumber = function (height: any, width: any) {
    // subtract the p tag height
    height = height * 0.75;
    // one block is 2.5vw high
    let blockHeight = width * 0.025;
    return height / blockHeight;
  };

  // paint original placeholder map before generating
  const drawOriginalMap = function () {
    const { innerWidth: width, innerHeight: height } = window;
    let row = calcOriginalMapRowNumber(height, width);
    row = parseInt(row.toString()) + 1;
    setRowNumber(row);
  };

  const isTerrainItem = (item: any): item is TerrainItemType => {
    return item && typeof item === 'object' && '$kind' in item;
  };

  const withinRange = (value: TerrainItemType, arr: TerrainItemType[]) => {
    if (!isTerrainItem(value) || !Array.isArray(arr)) {
      return false;
    }

    let result = false;
    arr.forEach(item => {
      if (isTerrainItem(item) && item.$kind === value.$kind) {
        result = true;
      }
    });
    return result;
  };

  // const initialRandomState = () => {
  //   console.log('initialRandomState');
  //   console.log(mapData);
  //   if (mapData.map.length === 0) {
  //     return {};
  //   }
  //   let randomState = {};
  //   // console.log(mapData.map[0]);
  //   for (let i = 0; i < mapData.map.length; i++) {
  //     for (let j = 0; j < 32; j++) {
  //       let key = `${i}-${j}`;
  //       randomState[key] = Math.floor(Math.random() * spriteCount + 1);
  //       if (
  //         mapData.ele_description.object !== undefined &&
  //         withinRange(mapData.map[i][j], mapData.ele_description.object)
  //       ) {
  //         randomState[key] = Math.floor(Math.random() * treasureCount + 1);
  //       } else if (withinRange(mapData.map[i][j], mapData.ele_description.sprite)) {
  //         randomState[key] = Math.floor(Math.random() * spriteCount + 1);
  //       }
  //     }
  //   }
  //   // setRandomState(randomState);
  //   return randomState;
  // };

  const initialEvents = () => {
    if (mapData.events === undefined) {
      return {};
    }
    if (mapData.events.length === 0) {
      return {};
    }
    let eventsDict = {};
    for (let i = 0; i < mapData.events.length; i++) {
      let event = mapData.events[i];
      let key = `${event.y}-${event.x}`;
      eventsDict[key] = event;
    }
    return eventsDict;
  };

  // let randomState1 = useMemo(() => initialRandomState(), [mapData]);
  let eventsState = useMemo(() => initialEvents(), [mapData]);

  const setBlockType = (map: any[][], x: number, y: number, ele_description: any, blockType: any, key: any) => {
    let img: ReactElement;
    let className = '';
    const title =
      eventsState[`${x}-${y}`] !== undefined ? (
        <div style={{ position: 'absolute', top: `${2.5 * x - 1.25}vw`, left: `${2.5 * y + 1.25}vw`, color: 'red' }}>
          !
        </div>
      ) : (
        ''
      );
    // console.log(map[x][y]);
    if (withinRange(map[x][y], ele_description.green)) {
      className = 'walkable green';
    } else if (withinRange(map[x][y], ele_description.small_tree)) {
      className = 'unwalkable small-tree-img';
    } else if (withinRange(map[x][y], ele_description.tussock)) {
      className = 'walkable tussock';
      // } else if (ele_description.object !== undefined && withinRange(map[x][y], ele_description.object)) {
      //   let lockState = unboxState[`${x}-${y}`] === true ? 'unlocked' : 'locked';
      //   let randomStateKey = randomState1[`${x}-${y}`];
      //   const object = `treasure-${lockState}-${randomStateKey}`;
      //   className = `unwalkable ${object}`;
      //   img = (
      //     <img
      //       src={require(`../assets/img/block/${object}.png`)}
      //       alt={object}
      //       onClick={() => onInteract(x, y)}
      //       style={{ cursor: ifInRange(x, y) ? 'pointer' : '' }}
      //     />
      //   );
      // } else if (withinRange(map[x][y], ele_description.sprite)) {
      //   const sprite = 'sprite' + randomState1[`${x}-${y}`];
      //   className = `unwalkable ${sprite}`;
      //   const ncp_image = mapData.map_type == 'gallery' ? 'gallery_house' : sprite;
      //   img = (
      //     <img
      //       src={require(`../assets/img/block/${ncp_image}.png`)}
      //       alt={ncp_image}
      //       onClick={() => onInteract(x, y)}
      //       style={{ cursor: ifInRange(x, y) ? 'pointer' : '' }}
      //     />
      //   );
    }
    return (
      <div className={`map-block flex ${className} ${blockType}`} key={key}>
        {title}
        {img}
      </div>
    );
  };

  const drawBlock = (map, i, j, type, ele_description, key) => {
    let blockType = '';
    if (['ice', 'sand', 'green'].includes(type)) {
      blockType = type;
    }
    return setBlockType(map, i, j, ele_description, blockType, key);
  };

  useEffect(() => {
    drawOriginalMap();
  });

  // -------------------- Game Logic --------------------
  const stepLength = 2.5;
  let direction = null;
  let targetPosition = null;
  const mapContainerRef = useRef(null);
  const heroRef = useRef(null);
  const [heroPosition, setHeroPosition] = useState({ left: hero['position']['left'], top: hero['position']['top'] });
  // const [heroIsLocked, setHeroIsLocked] = useState(hero['lock']);
  const [haveMonster, setHaveMonster] = useState(monster['exist']);
  // const [heroPosition, setHeroPosition] = useState({left: 5, top: 5});

  // useEffect(() => {
  //   if (haveMonster === true) {
  //     console.log('have monster');
  //     console.log(haveMonster);
  //     interactPVP();
  //   }
  // }, [haveMonster]);

  // move moving-block when possible
  const move = async (direction: string, stepLength: number) => {
    if (willCrossBorder(direction, stepLength)) {
      console.log('will cross border');
      return;
    }
    const currentPosition = getCoordinate(stepLength);

    console.log(hero['lock']);
    if (hero['lock']) {
      console.log('player is locked');
      return;
    }

    if (willCollide(currentPosition, direction)) {
      console.log('collide');
      return;
    }

    let stepTransactionsItem = stepTransactions;
    let newPosition = heroPosition;

    switch (direction) {
      case 'left':
        newPosition.left = heroPosition.left - stepLength;
        setHeroPosition({ ...newPosition });
        stepTransactionsItem.push([newPosition.left / stepLength, newPosition.top / stepLength, direction]);
        break;
      case 'top':
        newPosition.top = heroPosition.top - stepLength;
        setHeroPosition({ ...newPosition });
        scrollIfNeeded('top');
        stepTransactionsItem.push([newPosition.left / stepLength, newPosition.top / stepLength, direction]);
        break;
      case 'right':
        newPosition.left = heroPosition.left + stepLength;
        setHeroPosition({ ...newPosition });
        stepTransactionsItem.push([newPosition.left / stepLength, newPosition.top / stepLength, direction]);
        break;
      case 'bottom':
        newPosition.top = heroPosition.top + stepLength;
        setHeroPosition({ ...newPosition });
        scrollIfNeeded('bottom');
        stepTransactionsItem.push([newPosition.left / stepLength, newPosition.top / stepLength, direction]);
        break;
      default:
        break;
    }
    setStepTransactions(stepTransactionsItem);
    console.log(stepTransactionsItem);
    console.log(mapData.map[newPosition.top / stepLength][newPosition.left / stepLength]);
    console.log(
      withinRange(
        mapData.map[newPosition.top / stepLength][newPosition.left / stepLength],
        mapData.ele_description.tussock,
      ),
    );
    if (
      withinRange(
        mapData.map[newPosition.top / stepLength][newPosition.left / stepLength],
        mapData.ele_description.tussock,
      )
    ) {
      console.log('------------- in tussock');

      const txHash = await savingGameWorld(true);

      const dubhe = new Dubhe({
        networkType: NETWORK,
        packageId: PACKAGE_ID,
        metadata: contractMetadata,
      });
      await dubhe.waitForTransaction(txHash);
      let enconterTx = new Transaction();
      const encounter_info = await dubhe.state({
        tx: enconterTx,
        schema: 'monster_info',
        params: [enconterTx.object(SCHEMA_ID), enconterTx.pure.address(signerAddress)],
      });
      let encounter_contain = false;
      if (encounter_info !== undefined) {
        encounter_contain = true;
      }
      setHero({
        ...hero,
        lock: encounter_contain,
      });
    }
    if (stepTransactionsItem.length === 100) {
      await savingGameWorld();
    }
  };

  const savingGameWorld = async (byLock?: boolean): Promise<string> => {
    if (byLock === true) {
      setHero({
        ...hero,
        lock: true,
      });
    }

    if (stepTransactions.length !== 0) {
      let stepTransactionsItem = stepTransactions;
      setStepTransactions([]);
      const dubhe = new Dubhe({
        networkType: NETWORK,
        packageId: PACKAGE_ID,
        metadata: contractMetadata,
        // secretKey: PRIVATEKEY,
      });
      const stepTxB = new Transaction();
      let schemaObject = stepTxB.object(SCHEMA_ID);
      let clockObject = stepTxB.object.clock();

      // Calculate dynamic gas budget
      // Base gas budget
      const BASE_GAS = 10000000;
      // Additional gas cost per move operation
      const MOVE_OPERATION_GAS = 1000000;
      // Calculate total gas based on number of operations
      const totalGas = BASE_GAS + stepTransactionsItem.length * MOVE_OPERATION_GAS;

      // Set gas budget
      stepTxB.setGasBudget(totalGas);

      for (let historyDirection of stepTransactionsItem) {
        let direction = null;
        switch (historyDirection[2]) {
          case 'left':
            console.log('Processing move: left');
            direction = (await dubhe.tx.direction.new_west({
              tx: stepTxB,
              isRaw: true,
            })) as TransactionResult;
            break;
          case 'top':
            console.log('Processing move: top');
            direction = (await dubhe.tx.direction.new_north({
              tx: stepTxB,
              isRaw: true,
            })) as TransactionResult;
            break;
          case 'right':
            console.log('Processing move: right');
            direction = (await dubhe.tx.direction.new_east({
              tx: stepTxB,
              isRaw: true,
            })) as TransactionResult;
            break;
          case 'bottom':
            console.log('Processing move: bottom');
            direction = (await dubhe.tx.direction.new_south({
              tx: stepTxB,
              isRaw: true,
            })) as TransactionResult;
            break;
          default:
            break;
        }
        await dubhe.tx.map_system.move_position({
          tx: stepTxB,
          params: [schemaObject, clockObject, direction],
          isRaw: true,
        });
      }

      // Add gas usage logging
      console.log(`Estimated Gas Budget: ${totalGas}, Number of Operations: ${stepTransactionsItem.length}`);

      let txHash = null;
      await signAndExecuteTransaction(
        {
          transaction: stepTxB.serialize(),
          chain: `sui:${NETWORK}`,
        },
        {
          onSuccess: async result => {
            txHash = result.digest;
            console.log('Transaction successful, digest:', result.digest);

            setTimeout(async () => {
              toast('Transaction Successful', {
                description: `${new Date().toUTCString()} - Gas Budget: ${totalGas}`,
                action: {
                  label: 'Check in Explorer',
                  onClick: () => window.open(dubhe.getTxExplorerUrl(result.digest), '_blank'),
                },
              });
            }, 2000);
          },
          onError: error => {
            console.error('Transaction failed:', error);
            toast.error(`Transaction failed. Gas budget might be insufficient (${totalGas})`);
          },
        },
      );
      return txHash;
    }
  };

  // check if moving-block will be out of map
  const willCrossBorder = (direction: any, stepLength: number) => {
    if (direction === 'left') {
      return heroPosition.left - stepLength < 0;
    } else if (direction === 'right') {
      // FIXME
      // return heroPosition.left + oDiv.clientWidth + stepLength > map.clientWidth;
      return heroPosition.left + 2 * stepLength > stepLength * 32;
    } else if (direction === 'top') {
      return heroPosition.top - stepLength < 0;
    } else if (direction === 'bottom') {
      return heroPosition.top + 2 * stepLength > stepLength * mapData.map.length;
    }
  };

  const scrollSmoothly = (scrollLength: any, scrollStep: any) => {
    const scrollInterval = setInterval(() => {
      mapContainerRef.current.scrollBy(0, scrollStep);
      scrollLength -= scrollStep;
      if (scrollLength === 0) {
        clearInterval(scrollInterval);
      }
    });
  };

  // scroll map when part of moving-block is out of wrapper
  const scrollIfNeeded = (direction: string) => {
    const scrollLength = parseInt((mapContainerRef.current.clientHeight / 3).toString());
    console.log(`${direction}`);
    console.log(`scroll ${scrollLength}`);
    console.log(
      `bottom ${heroRef.current.getBoundingClientRect().bottom} ${
        mapContainerRef.current.getBoundingClientRect().bottom
      }`,
    );
    console.log(
      `top ${heroRef.current.getBoundingClientRect().top} ${mapContainerRef.current.getBoundingClientRect().top}`,
    );
    if (
      direction === 'bottom' &&
      heroRef.current.getBoundingClientRect().bottom > mapContainerRef.current.getBoundingClientRect().bottom
    ) {
      console.log('-------- bottom');
      scrollSmoothly(scrollLength, 1);
    } else if (
      direction === 'top' &&
      heroRef.current.getBoundingClientRect().top < mapContainerRef.current.getBoundingClientRect().top
    ) {
      console.log('-------- top');
      scrollSmoothly(-scrollLength, -1);
    }
  };

  const getCoordinate = (stepLength: number) => {
    const x = heroPosition.top / stepLength;
    const y = heroPosition.left / stepLength;

    return { x, y };
  };

  const willCollide = (currentPosition: any, direction: string) => {
    let { x, y } = currentPosition;

    if (direction === 'left') {
      y -= 1;
    } else if (direction === 'right') {
      y += 1;
    } else if (direction === 'top') {
      x -= 1;
    } else if (direction === 'bottom') {
      x += 1;
    }
    // FIXME: if !unwalkable => walkable?
    return !withinRange(mapData.map[x][y], mapData.ele_description.walkable);
  };

  // const onInteract = async (npcX: number, npcY: number) => {
  //   const currentPosition = getCoordinate(stepLength);
  //   // check if npc is in range
  //   if (
  //     (currentPosition.x === npcX && (currentPosition.y - npcY == 1 || currentPosition.y - npcY == -1)) ||
  //     (currentPosition.y === npcY && (currentPosition.x - npcX == 1 || currentPosition.x - npcX == -1))
  //   ) {
  //     // await interactNpc({x: npcX, y: npcY});
  //     const targetBlock = mapData.map[npcX][npcY];
  //     console.log(targetBlock);
  //     if (withinRange(targetBlock, mapData.ele_description.sprite)) {
  //       // await interactNpc({x: npcX, y: npcY});
  //       await interactNpc();
  //     } else if (withinRange(targetBlock, mapData.ele_description.object)) {
  //       openTreasureBox({ x: npcX, y: npcY });
  //       // } else if (withinRange(targetBlock, mapData.ele_description.obelisk_bottom)) {
  //       //   openTreasureBox({ x: npcX, y: npcY });
  //       // } else if (withinRange(targetBlock, mapData.ele_description.old_man)) {
  //       //   openTreasureBox({ x: npcX, y: npcY });
  //       // } else if (withinRange(targetBlock, mapData.ele_description.fat_man)) {
  //       //   openTreasureBox({ x: npcX, y: npcY });
  //     }
  //   }
  // };

  const interact = async (direction: string) => {
    if (!direction) {
      return;
    }

    const currentPosition = getCoordinate(stepLength);
    switch (direction) {
      case 'left':
        targetPosition = {
          x: currentPosition.x,
          y: currentPosition.y - 1,
        };
        break;
      case 'right':
        targetPosition = {
          x: currentPosition.x,
          y: currentPosition.y + 1,
        };
        break;
      case 'top':
        targetPosition = {
          x: currentPosition.x - 1,
          y: currentPosition.y,
        };
        break;
      case 'bottom':
        targetPosition = {
          x: currentPosition.x + 1,
          y: currentPosition.y,
        };
        break;
      default:
        break;
    }
  };

  const interactPVP = () => {
    showPVPModalLog({
      text: 'Have monster',
      btn: {
        yes: 'Throw',
        no: 'Run',
      },
    });
  };
  const showPVPModalLog = (dialogContent: any) => {
    setSendTxLog({
      display: true,
      content: dialogContent.text,
      yesContent: dialogContent.btn.yes,
      noContent: dialogContent.btn.no,
    });
  };

  const showNpcDialog = (dialogContent: any) => {
    setDialog({
      display: true,
      content: dialogContent.text,
      yesContent: dialogContent.btn.yes,
      noContent: dialogContent.btn.no,
    });
  };

  const openTreasureBox = targetPosition => {
    let key = `${targetPosition.x}-${targetPosition.y}`;
    let _unboxState = { ...unboxState };
    _unboxState[key] = true;
    setUnboxState(_unboxState);
    // FIXME: use data to change element
    const treasureBox = document.querySelectorAll('.map-row')[targetPosition.x].children.item(targetPosition.y);

    treasureBox.className = treasureBox.className.replace('treasure-locked', 'treasure-unlocked');
    treasureBox.children[0]['src'] = require('../assets/img/block/treasure-unlocked-1.png');
  };

  // const getInteractResponse = async () => {
  //   const { x, y } = targetPosition;

  //   // let interactApi = `https://indexer.obelisk.build?x=${y}&y=${x}&block_height=${blockNumber}`;

  //   // let interactResponse = await axios
  //   //   .get(interactApi)
  //   //   .catch((err) => {
  //   //     console.log(err);
  //   //   });

  //   // return interactResponse.data;
  //   return {
  //     text: 'hello, obelisk!',
  //     btn: {
  //       yes: 'yes',
  //       no: 'no',
  //     },
  //   };
  // };

  const getOldManResponse = async () => {
    const { x, y } = targetPosition;

    return {
      text: 'Please look forward to our future updates!',
      btn: {
        yes: 'I will',
        no: 'no',
      },
    };
  };

  useEffect(() => {
    const onKeyDown = async (ev: any) => {
      // var ev = ev || event;
      var keyCode = ev.keyCode;
      switch (keyCode) {
        case 37:
          ev.preventDefault();
          direction = 'left';
          setHeroImg(playerSprites['A']);
          await move(direction, stepLength);
          break;
        case 38:
          ev.preventDefault();
          direction = 'top';
          setHeroImg(playerSprites['W']);
          await move(direction, stepLength);
          break;
        case 39:
          ev.preventDefault();
          direction = 'right';
          setHeroImg(playerSprites['D']);
          await move(direction, stepLength);
          break;
        case 40:
          ev.preventDefault();
          direction = 'bottom';
          setHeroImg(playerSprites['S']);
          await move(direction, stepLength);
          break;
        case 32:
          ev.preventDefault();
          await interact(direction);
          break;
        case 33: // PageUp
        case 34: // PageDown
        case 35: // End
        case 36: // Home
          ev.preventDefault();
      }
    };

    const onKeyUp = (ev: any) => {
      // var ev = ev || event;
      var keyCode = ev.keyCode;

      switch (keyCode) {
        case 37:
          ev.preventDefault();
          direction = 'left';
          break;
        case 38:
          ev.preventDefault();
          direction = 'top';
          break;
        case 39:
          ev.preventDefault();
          direction = 'right';
          break;
        case 40:
          ev.preventDefault();
          direction = 'bottom';
          break;
        case 32:
          ev.preventDefault();
          break;
        default:
          ev.preventDefault();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [mapData, heroPosition, stepTransactions, hero]);

  return (
    <>
      <div id="map-wrapper">
        {mapData.map && (
          <div style={{ textAlign: 'center' }}>
            Player position: ({heroPosition.left / stepLength}, {heroPosition.top / stepLength})
          </div>
        )}
        <div id="original-map" hidden={mapData.map.length !== 0}>
          {Array.from(Array(rowNumber).keys()).map((row, rowId) => {
            return (
              <div className="original-map-row flex" key={rowId}>
                {Array.from(Array(mapData.map[0].length).keys()).map((n, i) => {
                  return <div className="original-map-block flex" key={i}></div>;
                })}
              </div>
            );
          })}
        </div>
        <div id="map-container" ref={mapContainerRef}>
          <div
            id="moving-block"
            hidden={mapData.map.length === 0}
            ref={heroRef}
            style={{ left: `${heroPosition.left}vw`, top: `${heroPosition.top}vw` }}
          >
            <div id="hero-name">{hero.name}</div>
            <div className="xiaozhi">
              <img src={heroImg} alt="" />
            </div>
          </div>
          {allPlayers.map(
            player =>
              player.address !== hero.name && (
                <div
                  key={player.address}
                  id="moving-block"
                  style={{
                    left: `${player.position.left}vw`,
                    top: `${player.position.top}vw`,
                  }}
                >
                  <div id="hero-name">{`${player.address.slice(0, 6)}`}</div>
                  <div className="xiaozhi">
                    <img src="/assets/player/S.gif" alt="" />
                  </div>
                </div>
              ),
          )}
          <div id="map">
            {mapData.map &&
              mapData.map.map((row: any, rowId: any) => {
                return (
                  <div className="map-row flex" key={rowId}>
                    {Array.from(Array(mapData.map[0].length).keys()).map((n, j) => {
                      return drawBlock(mapData.map, rowId, j, mapData.type, mapData.ele_description, j);
                    })}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <div className="form-control flex" id="save">
        <button className="btn btn-primary btn-outline mx-5 my-5" id="button" onClick={() => savingGameWorld()}>
          Save
        </button>
      </div>
      <div className="mx-2 my-2 bg-white text-black" id="save">
        {stepTransactions.map((value: any, index: any) => (
          <>
            <div>
              {/* {`(${value[0]}, ${value[1]}) ${value[2]}`} */}
              {`${value[2]}`}
            </div>
          </>
        ))}
      </div>
      {/* <audio preload="auto" autoPlay loop>
        <source src="/assets/music/home.mp3" type="audio/mpeg" />
      </audio> */}
    </>
  );
}
