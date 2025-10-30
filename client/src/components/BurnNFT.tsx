import { AlertDialog, Button, Flex, Text, Badge } from "@radix-ui/themes";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "sonner";
import { useState } from "react";

type BurnNFTProps = {
  objectId: string;
};

export default function BurnNFT({ objectId }: BurnNFTProps) {
  const [status, setStatus] = useState("");
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
          setStatus(effects?.status.status!);
          toast.success("NFT burned successfuly.");
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

        {status && isSuccess && (
          <Flex direction={"column"} gap={"2"}>
            <Text>
              Status: <Badge color="green">{status}</Badge>
            </Text>
            <Text>NFT burned successfuly.</Text>
          </Flex>
        )}

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              variant="solid"
              color="red"
              onClick={burnNFT}
              disabled={isPending}
            >
              {isPending ? <ClipLoader size={20} /> : "Burn"}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
