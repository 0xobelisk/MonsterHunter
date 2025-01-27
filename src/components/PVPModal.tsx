import { Dubhe, Transaction } from '@0xobelisk/sui-client';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { SendTxLog, Hero, ContractMetadata, Monster, OwnedMonster } from '../state';
import { SCHEMA_ID, NETWORK, PACKAGE_ID } from '../chain/config';
import { TransactionResult } from '@0xobelisk/sui-client/src';
import { ConnectButton, useCurrentWallet, useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';

export default function PVPModal(props: any) {
  const catchResult = {
    Caught: 'Catch monster successed!',
    Fled: 'Monster got away.',
    Missed: 'Catch miss',
  };

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

      // const mapPositionTx = new Transaction();
      // let player_data = await dubhe.state({
      //   tx: mapPositionTx,
      //   schema: 'position',
      //   params: [mapPositionTx.object(SCHEMA_ID), mapPositionTx.pure.address(signerAddress)],
      // });

      // const encounterInfoTx = new Transaction();
      // const encounter_info = await dubhe.state({
      //   tx: encounterInfoTx,
      //   schema: 'monster_info',
      //   params: [encounterInfoTx.object(SCHEMA_ID), encounterInfoTx.pure.address(signerAddress)],
      // });

      // let encounter_contain = false;
      // if (encounter_info !== undefined) {
      //   encounter_contain = true;
      // }
      // console.log(encounter_contain);
      // console.log(JSON.stringify(player_data));
      // const stepLength = 2.5;
      // setHero({
      //   name: signerAddress,
      //   position: { left: player_data[0] * stepLength, top: player_data[1] * stepLength },
      //   lock: encounter_contain,
      // });
      // setMonster({
      //   exist: encounter_contain,
      // });
      // if (encounter_contain === false) {
      //   setSendTxLog({ ...sendTxLog, display: false });
      // }
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
    const dubhe = new Dubhe({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: contractMetadata,
    });

    let tx = new Transaction();
    let params = [tx.object(SCHEMA_ID), tx.object.random()];

    // 发送抓取请求
    (await dubhe.tx.encounter_system.throw_ball({
      tx,
      params,
      isRaw: true,
    })) as TransactionResult;

    await signAndExecuteTransaction(
      {
        transaction: tx.serialize(),
        chain: `sui:${NETWORK}`,
      },
      {
        onSuccess: async result => {
          setTimeout(async () => {
            toast('Transaction Successful', {
              description: new Date().toUTCString(),
              action: {
                label: 'Check in Explorer',
                onClick: () => window.open(dubhe.getTxExplorerUrl(result.digest), '_blank'),
              },
            });
          }, 2000);
        },
        onError: error => {
          toast.error('Transaction failed. Please try again.');
        },
      },
    );
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
