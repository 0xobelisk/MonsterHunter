import { Dubhe, Transaction } from '@0xobelisk/sui-client';
import { useEffect, useState, useRef, useMemo, ReactElement } from 'react';

import { useAtom, useAtomValue } from 'jotai';
import { ContractMetadata, Hero, TerrainItemType } from '../state';
import { NETWORK, PACKAGE_ID, SCHEMA_ID } from '../../chain/config';
import { TransactionResult } from '@0xobelisk/sui-client/src';
import { toast } from 'sonner';
import { PRIVATEKEY } from '../../chain/key';

type Props = {
  width: number;
  height: number;
  terrain: TerrainItemType[][];
  players: {
    address: string;
    position: {
      left: number;
      top: number;
    };
  }[];
  type: string;
  ele_description: Record<string, TerrainItemType[]>;
  events: {
    x: number;
    y: number;
  }[];
  map_type: string;
  metadata: any;
};

export function Map({ width, height, terrain, players, type, ele_description, events, map_type, metadata }: Props) {
  let playerSprites = {
    W: 'assets/player/W.gif',
    S: 'assets/player/S.gif',
    A: 'assets/player/A.gif',
    D: 'assets/player/D.gif',
  };

  const [heroImg, setHeroImg] = useState(playerSprites['S']);
  let [rowNumber, setRowNumber] = useState(1);
  const contractMetadata = useAtomValue(ContractMetadata);
  const [hero, setHero] = useAtom(Hero);

  const [stepTransactions, setStepTransactions] = useState<any[][]>([]);

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
    return item && typeof item === 'object';
  };

  const withinRange = (value: TerrainItemType, arr: TerrainItemType[]) => {
    if (!isTerrainItem(value) || !Array.isArray(arr)) {
      return false;
    }

    let result = false;
    arr.forEach(item => {
      if (isTerrainItem(item) && Object.keys(item)[0] === Object.keys(value)[0]) {
        result = true;
      }
    });
    return result;
  };

  const initialEvents = () => {
    if (events === undefined) {
      return {};
    }
    if (events.length === 0) {
      return {};
    }
    let eventsDict = {};
    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      let key = `${event.y}-${event.x}`;
      eventsDict[key] = event;
    }
    return eventsDict;
  };

  // let randomState1 = useMemo(() => initialRandomState(), [mapData]);
  let eventsState = useMemo(() => initialEvents(), [events]);

  const setBlockType = (
    map: TerrainItemType[][],
    x: number,
    y: number,
    ele_description: any,
    blockType: any,
    key: any,
  ) => {
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

  // move moving-block when possible
  const move = async (direction: string, stepLength: number) => {
    if (willCrossBorder(direction, stepLength)) {
      return;
    }
    const currentPosition = getCoordinate(stepLength);

    if (hero['lock']) {
      return;
    }

    if (willCollide(currentPosition, direction)) {
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

    const isTussock = withinRange(
      terrain[newPosition.top / stepLength][newPosition.left / stepLength],
      ele_description.tussock,
    );

    if (isTussock || stepTransactionsItem.length === 100) {
      const txHash = await savingGameWorld(isTussock);

      if (isTussock) {
        const dubhe = new Dubhe({
          networkType: NETWORK,
          packageId: PACKAGE_ID,
          metadata,
          secretKey: PRIVATEKEY,
        });

        await dubhe.waitForTransaction(txHash);
        let enconterTx = new Transaction();
        const encounter_info = await dubhe.state({
          tx: enconterTx,
          schema: 'encounter',
          params: [enconterTx.object(SCHEMA_ID), enconterTx.pure.address(dubhe.getAddress())],
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
    }
  };

  const savingGameWorld = async (byLock?: boolean): Promise<string> => {
    if (byLock === true) {
      setHero({
        ...hero,
        lock: true,
      });
    }

    if (stepTransactions.length === 0) {
      return null;
    }

    let stepTransactionsItem = stepTransactions;
    setStepTransactions([]);

    const dubhe = new Dubhe({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: contractMetadata,
      secretKey: PRIVATEKEY,
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
    let txHash = null;

    for (let historyDirection of stepTransactionsItem) {
      let direction = null;
      console.log(historyDirection[2]);

      switch (historyDirection[2]) {
        case 'left':
          console.log('Processing move: left');
          direction = (await dubhe.tx.monster_hunter_direction.new_west({
            tx: stepTxB,
            isRaw: true,
          })) as TransactionResult;
          break;
        case 'top':
          console.log('Processing move: top');
          direction = (await dubhe.tx.monster_hunter_direction.new_north({
            tx: stepTxB,
            isRaw: true,
          })) as TransactionResult;
          break;
        case 'right':
          console.log('Processing move: right');
          direction = (await dubhe.tx.monster_hunter_direction.new_east({
            tx: stepTxB,
            isRaw: true,
          })) as TransactionResult;
          break;
        case 'bottom':
          console.log('Processing move: bottom');
          direction = (await dubhe.tx.monster_hunter_direction.new_south({
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

    await dubhe.signAndSendTxn({
      tx: stepTxB,
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
    });
    return txHash;
  };

  // check if moving-block will be out of map
  const willCrossBorder = (direction: any, stepLength: number) => {
    if (direction === 'left') {
      return heroPosition.left - stepLength < 0;
    } else if (direction === 'right') {
      return heroPosition.left + 2 * stepLength > stepLength * width;
    } else if (direction === 'top') {
      return heroPosition.top - stepLength < 0;
    } else if (direction === 'bottom') {
      return heroPosition.top + 2 * stepLength > stepLength * height;
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
    if (
      direction === 'bottom' &&
      heroRef.current.getBoundingClientRect().bottom > mapContainerRef.current.getBoundingClientRect().bottom
    ) {
      scrollSmoothly(scrollLength, 1);
    } else if (
      direction === 'top' &&
      heroRef.current.getBoundingClientRect().top < mapContainerRef.current.getBoundingClientRect().top
    ) {
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

    if (x < 0 || x >= height || y < 0 || y >= width) {
      return true;
    }

    return !withinRange(terrain[x][y], ele_description.walkable);
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
  }, [heroPosition, stepTransactions, hero]);

  return (
    <>
      <div id="map-wrapper">
        {terrain && (
          <div style={{ textAlign: 'center' }}>
            <div className="flex justify-between items-center px-4 py-2">
              <div>
                Player position: ({heroPosition.left / stepLength}, {heroPosition.top / stepLength})
              </div>
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-colors duration-200"
                onClick={() => savingGameWorld()}
              >
                Save
              </button>
            </div>
          </div>
        )}
        <div id="original-map" hidden={height !== 0}>
          {Array.from(Array(rowNumber).keys()).map((row, rowId) => {
            return (
              <div className="original-map-row flex" key={rowId}>
                {Array.from(Array(width).keys()).map((n, i) => {
                  return <div className="original-map-block flex" key={i}></div>;
                })}
              </div>
            );
          })}
        </div>
        <div id="map-container" ref={mapContainerRef}>
          <div
            id="moving-block"
            hidden={height === 0}
            ref={heroRef}
            style={{ left: `${heroPosition.left}vw`, top: `${heroPosition.top}vw` }}
          >
            <div id="hero-name">{hero.name}</div>
            <div className="xiaozhi">
              <img src={heroImg} alt="" />
            </div>
          </div>
          {players?.map(
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
            {terrain &&
              terrain.map((row: any, rowId: any) => {
                return (
                  <div className="map-row flex" key={rowId}>
                    {Array.from(Array(width).keys()).map((n, j) => {
                      return drawBlock(terrain, rowId, j, type, ele_description, j);
                    })}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <div className="mx-2 my-2 bg-white text-black" id="save">
        {stepTransactions.map((value: any, index: any) => (
          <div key={index}>{`${value[2]}`}</div>
        ))}
      </div>
      {/* <audio preload="auto" autoPlay loop>
        <source src="/assets/music/home.mp3" type="audio/mpeg" />
      </audio> */}
    </>
  );
}
