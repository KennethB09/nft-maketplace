import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";

type BurnNFTProps = {
  objectId: string;
};

export default function BurnNFT({ objectId }: BurnNFTProps) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  function burnNFT() {
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::nft_marketplace::burn_nft`,
      arguments: [tx.object(objectId)],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async ({ digest }) => {
          const { effects } = await suiClient.waitForTransaction({
            digest: digest,
            options: {
              showEffects: true,
            },
          });
        },
      },
    );
  }

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button variant="outline" color="red">
          Burn NFT
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Burn NFT</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure? This NFT will be deleted permanently.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button onClick={burnNFT} variant="solid" color="red">
              Burn
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
