import { Dubhe, Transaction } from '@0xobelisk/sui-client';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { SendTxLog, Hero, ContractMetadata, Monster, OwnedMonster } from '../state';
import { SCHEMA_ID, NETWORK, PACKAGE_ID } from '../chain/config';
import { TransactionResult } from '@0xobelisk/sui-client/src';
import { ConnectButton, useCurrentWallet, useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';

export default function PVPModal(props: any) {
  const catchResult = ['Catch monster successed!', 'Monster got away.', 'Catch miss'];

  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { connectionStatus } = useCurrentWallet();
  const signerAddress = useCurrentAccount()?.address;

  const [sendTxLog, setSendTxLog] = useAtom(SendTxLog);
  const contractMetadata = useAtomValue(ContractMetadata);
  const setMonster = useSetAtom(Monster);
  const [ownedMonster, setOwnedMonster] = useAtom(OwnedMonster);
  const setHero = useSetAtom(Hero);

  const handleNoTxLog = async () => {
    // if (sendTxLog.onYes !== undefined) {
    // sendTxLog.onYes();
    const dubhe = new Dubhe({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: contractMetadata,
      // secretKey: PRIVATEKEY,
    });

    let tx = new Transaction();
    let params = [tx.object(SCHEMA_ID)];

    // await obelisk.tx.encounter_system.flee(tx, params, undefined, true);

    (await dubhe.tx.encounter_system.flee({
      tx,
      params,
      isRaw: true,
    })) as TransactionResult;

    try {
      await signAndExecuteTransaction(
        {
          transaction: tx.serialize(),
          chain: `sui:${NETWORK}`,
        },
        {
          onSuccess: async result => {
            // Wait for a short period before querying the latest data
            setTimeout(async () => {
              toast('Transaction Successful', {
                description: new Date().toUTCString(),
                action: {
                  label: 'Check in Explorer',
                  onClick: () => window.open(dubhe.getTxExplorerUrl(result.digest), '_blank'),
                },
              });
            }, 2000); // Wait for 2 seconds before querying, adjust as needed
          },
          onError: error => {
            toast.error('Transaction failed. Please try again.');
          },
        },
      );

      const mapPositionTx = new Transaction();
      let player_data = await dubhe.state({
        tx: mapPositionTx,
        schema: 'position',
        params: [mapPositionTx.object(SCHEMA_ID), mapPositionTx.pure.address(signerAddress)],
      });

      const encounterInfoTx = new Transaction();
      const encounter_info = await dubhe.state({
        tx: encounterInfoTx,
        schema: 'monster_info',
        params: [encounterInfoTx.object(SCHEMA_ID), encounterInfoTx.pure.address(signerAddress)],
      });

      let encounter_contain = false;
      if (encounter_info !== undefined) {
        encounter_contain = true;
      }
      console.log(encounter_contain);
      console.log(JSON.stringify(player_data));
      const stepLength = 2.5;
      setHero({
        name: signerAddress,
        position: { left: player_data[0] * stepLength, top: player_data[1] * stepLength },
        lock: encounter_contain,
      });
      setMonster({
        exist: encounter_contain,
      });
      if (encounter_contain === false) {
        setSendTxLog({ ...sendTxLog, display: false });
      }
    } catch (e) {
      alert('failed');
      console.error('failed', e);
    }

    // const response = await obelisk.signAndSendTxn(tx);
    // console.log(response);
    // }

    // if (sendTxLog.onNo !== undefined) {
    //   sendTxLog.onNo();
    // }
    // dispatch(setSendTxLog({ ...sendTxLog, display: false }));
  };

  // const handleYesTxLog = () => {
  //   if (sendTxLog.onYes !== undefined) { sendTxLog.onYes(); }
  //   dispatch(setSendTxLog({ ...sendTxLog, display: false }));
  // }

  const handleYesTxLog = async () => {
    console.log(sendTxLog);
    // if (sendTxLog.onYes !== undefined) {
    console.log('------- 1');
    // sendTxLog.onYes();
    const dubhe = new Dubhe({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: contractMetadata,
      // secretKey: PRIVATEKEY,
    });

    let tx = new Transaction();
    let params = [tx.object(SCHEMA_ID)];

    // let txb = await obelisk.tx.encounter_system.throw_ball(tx, params, undefined, true);
    // console.log(txb);
    (await dubhe.tx.encounter_system.throw_ball({
      tx,
      params,
      isRaw: true,
    })) as TransactionResult;

    // const response = await obelisk.signAndSendTxn(tx);
    // console.log(response);
    try {
      const { digest } = await signAndExecuteTransaction(
        {
          transaction: tx.serialize(),
          chain: `sui:${NETWORK}`,
        },
        {
          onSuccess: async result => {
            // Wait for a short period before querying the latest data
            setTimeout(async () => {
              toast('Transaction Successful', {
                description: new Date().toUTCString(),
                action: {
                  label: 'Check in Explorer',
                  onClick: () => window.open(dubhe.getTxExplorerUrl(result.digest), '_blank'),
                },
              });
            }, 2000); // Wait for 2 seconds before querying, adjust as needed
          },
          onError: error => {
            toast.error('Transaction failed. Please try again.');
          },
        },
      );
      let catch_result = -1;
      const resp = await dubhe.waitForTransaction(digest);
      const catchEvent = resp.events?.find(e => e.type.includes('catch_result')) as any;
      catch_result = catchEvent.parsedJson['data']['value'];
      // if (resp.effects.status.status === 'success') {
      //   resp.events.map(event => {
      //     let obelisk_schema_id = event.parsedJson['_obelisk_schema_id'];
      //     console.log(obelisk_schema_id);
      //     const textDecoder = new TextDecoder('utf-8');
      //     const obelisk_schema_name = textDecoder.decode(new Uint8Array(obelisk_schema_id));

      //     if (obelisk_schema_name === 'catch_result') {
      //       catch_result = event.parsedJson['data']['value'];
      //     }
      //   });
      // } else {
      //   alert('Fetch sui api failed.');
      // }
      const mapPositionTx = new Transaction();
      const player_data = await dubhe.state({
        tx: mapPositionTx,
        schema: 'position',
        params: [mapPositionTx.object(SCHEMA_ID), mapPositionTx.pure.address(signerAddress)],
      });

      const encounterInfoTx = new Transaction();
      const encounter_info = await dubhe.state({
        tx: encounterInfoTx,
        schema: 'monster_info',
        params: [encounterInfoTx.object(SCHEMA_ID), encounterInfoTx.pure.address(signerAddress)],
      });

      let encounter_contain = false;
      if (encounter_info !== undefined) {
        encounter_contain = true;
      }
      console.log(encounter_contain);
      console.log(JSON.stringify(player_data));
      const stepLength = 2.5;
      setHero({
        name: signerAddress,
        position: { left: player_data[0] * stepLength, top: player_data[1] * stepLength },
        lock: encounter_contain,
      });
      setMonster({
        exist: encounter_contain,
      });
      if (encounter_contain === false) {
        setSendTxLog({ ...sendTxLog, display: false });
        console.log('catch successed');
      } else {
        console.log('catch failed');
      }
      console.log(`here  ------ ${catch_result}`);
      alert(catchResult[catch_result]);
    } catch (e) {
      alert('failed');
      console.error('failed', e);
    }
  };

  return (
    <div className="pvp-modal" hidden={!sendTxLog.display}>
      {/* <div className="dialog-content" dangerouslySetInnerHTML={{ __html: sendTxLog.content }}></div> */}
      <div className="pvp-modal-content">
        Have monster
        <img src="assets/monster/gui.jpg" />
      </div>

      <div className="pvp-modal-actions">
        <div
          className="pvp-modal-action-no"
          hidden={sendTxLog.noContent === '' || sendTxLog.noContent === undefined}
          onClick={() => handleNoTxLog()}
        >
          {sendTxLog.noContent}
        </div>
        <div
          className="pvp-modal-action-yes"
          hidden={sendTxLog.yesContent === '' || sendTxLog.yesContent === undefined}
          onClick={() => handleYesTxLog()}
        >
          {sendTxLog.yesContent}
        </div>
      </div>
    </div>
  );
}
