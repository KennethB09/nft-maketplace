import { AlertDialog, Button, Flex, Badge, Text } from "@radix-ui/themes";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "sonner";
import { useState } from "react";

type CancelListingProps = {
  objectId: string;
};

export default function CancelListing({ objectId }: CancelListingProps) {
  const [status, setStatus] = useState("");
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  async function delist() {
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::nft_marketplace::cancel_listing`,
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
          toast.success("NFT unlisted successfuly.");
        },
      },
    );
  }

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button variant="outline" color="red">
          Unlist NFT
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Unlist NFT</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure you want to unlist this NFT?
        </AlertDialog.Description>

        {status && isSuccess && (
          <Flex direction={"column"} gap={"2"} mt={"4"}>
            <Text>
              Status: <Badge color="green">{status}</Badge>
            </Text>
            <Text>NFT unlisted successfuly.</Text>
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
              onClick={delist}
              disabled={isPending}
              variant="solid"
              color="red"
            >
              {isPending ? <ClipLoader size={20} /> : "Unlist"}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
