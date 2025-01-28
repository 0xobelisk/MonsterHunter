import { DevInspectResults, Dubhe, Transaction } from '@0xobelisk/sui-client';
import { useEffect, useState, useRef, useMemo, ReactElement } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { MapData, ContractMetadata, Dialog, SendTxLog, Hero, Monster, OwnedMonster, TerrainItemType } from '../state';
import { NETWORK, PACKAGE_ID, SCHEMA_ID } from '../chain/config';
import { TransactionResult } from '@0xobelisk/sui-client/src';
import { toast } from 'sonner';
import { ADDRESS, PRIVATE_KEY } from 'src/chain/wallet';

export default function Map() {
  const playerSprites = {
    W: 'assets/player/W.gif',
    S: 'assets/player/S.gif',
    A: 'assets/player/A.gif',
    D: 'assets/player/D.gif',
  };
  const [heroImg, setHeroImg] = useState(playerSprites['S']);
  const [rowNumber, setRowNumber] = useState(1);
  const mapData = useAtomValue(MapData);
  const contractMetadata = useAtomValue(ContractMetadata);
  const [monster, setMonster] = useAtom(Monster);
  const [hero, setHero] = useAtom(Hero);
  const setDialog = useSetAtom(Dialog);
  const setSendTxLog = useSetAtom(SendTxLog);
  const [stepTransactions, setStepTransactions] = useState<any[][]>([]);
  const [heroPosition, setHeroPosition] = useState({ 
    left: hero['position']['left'], 
    top: hero['position']['top'] 
  });
  const [haveMonster, setHaveMonster] = useState(monster['exist']);

  // Add data validation check at the beginning of the component
  if (!mapData?.map?.length || !mapData.map[0]?.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-bold">Loading map data...</div>
      </div>
    );
  }

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

  useEffect(() => {
    if (haveMonster === true) {
      console.log('have monster');
      console.log(haveMonster);
      interactPVP();
    }
  }, [haveMonster]);

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
        secretKey: process.env.PRIVATE_KEY,
      });
      console.log(txHash);
      const txResponse = await dubhe.waitForTransaction(txHash);
      console.log(txResponse);
      const mapPositionTx = new Transaction();
      const player_data = await dubhe.state({
        tx: mapPositionTx,
        schema: 'position',
        params: [mapPositionTx.object(SCHEMA_ID), mapPositionTx.pure.address(ADDRESS)],
      });
      console.log('======== encounter info ========');
      let enconterTx = new Transaction();
      const encounter_info = await dubhe.state({
        tx: enconterTx,
        schema: 'monster_info',
        params: [enconterTx.object(SCHEMA_ID), enconterTx.pure.address(ADDRESS)],
      });
      console.log(encounter_info);
      let encounter_contain = false;
      if (encounter_info !== undefined) {
        encounter_contain = true;
      }
      const stepLength = 2.5;
      setHero({
        name: ADDRESS,
        position: { left: player_data[0] * stepLength, top: player_data[1] * stepLength },
        lock: encounter_contain,
      });
      console.log('---------- encounter_contain -------------');
      console.log(encounter_contain);
      setHaveMonster(encounter_contain);
      setMonster({
        exist: encounter_contain,
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
        secretKey: PRIVATE_KEY
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

    
      const result = await dubhe.signAndSendTxn(stepTxB);

      if (result.effects.status.status == 'success') {
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
      }
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
              {`${value[2]}`}
            </div>
          </>
        ))}
      </div>
    </>
  );
}
