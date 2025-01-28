import { Dubhe, Transaction } from '@0xobelisk/sui-client';
import { useAtom, useAtomValue} from 'jotai';
import { SendTxLog,ContractMetadata} from '../state';
import { SCHEMA_ID, NETWORK, PACKAGE_ID } from '../chain/config';
import { TransactionResult } from '@0xobelisk/sui-client/src';
import { toast } from 'sonner';
import { PRIVATE_KEY } from 'src/chain/wallet';

export default function PVPModal(props: any) {
  const [sendTxLog, setSendTxLog] = useAtom(SendTxLog);
  const contractMetadata = useAtomValue(ContractMetadata);

  const handleNoTxLog = async () => {
    const dubhe = new Dubhe({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: contractMetadata,
      secretKey: PRIVATE_KEY,
    });

    let tx = new Transaction();
    let params = [tx.object(SCHEMA_ID)];


    (await dubhe.tx.encounter_system.flee({
      tx,
      params,
      isRaw: true,
    })) as TransactionResult;

    try {
      const result = await dubhe.signAndSendTxn(tx);

    if (result.effects.status.status == 'success') {
      
      console.log('Transaction successful, digest:', result.digest);

      setTimeout(async () => {
        toast('Transaction Successful', {
          description: `${new Date().toUTCString()}`,
          action: {
            label: 'Check in Explorer',
            onClick: () => window.open(dubhe.getTxExplorerUrl(result.digest), '_blank'),
          },
        });
      }, 2000);
    }
    } catch (e) {
      alert('failed');
      console.error('failed', e);
    }
  };


  const handleYesTxLog = async () => {
    console.log(sendTxLog);
    const dubhe = new Dubhe({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: contractMetadata,
      secretKey:PRIVATE_KEY
    });

    let tx = new Transaction();
    let params = [tx.object(SCHEMA_ID), tx.object.random()];

    // 发送抓取请求
    (await dubhe.tx.encounter_system.throw_ball({
      tx,
      params,
      isRaw: true,
    })) as TransactionResult;

    const result = await dubhe.signAndSendTxn(tx);

    if (result.effects.status.status == 'success') {
      
      console.log('Transaction successful, digest:', result.digest);

      setTimeout(async () => {
        toast('Transaction Successful', {
          description: `${new Date().toUTCString()}`,
          action: {
            label: 'Check in Explorer',
            onClick: () => window.open(dubhe.getTxExplorerUrl(result.digest), '_blank'),
          },
        });
      }, 2000);
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
