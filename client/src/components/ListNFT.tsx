import { Flex, Dialog, TextField, Button, Badge, Text } from "@radix-ui/themes";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import ClipLoader from "react-spinners/ClipLoader";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";
import { toast } from "sonner";

type ListNFTProps = {
  objectId: string;
};

export default function ListNFT({ objectId }: ListNFTProps) {
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();

  const [price, setPrice] = useState<number>(1000000000);
  const [status, setStatus] = useState("");

  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  function listNFT() {
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::nft_marketplace::list_nft_for_sale`,
      arguments: [tx.object(objectId), tx.pure.u64(price)],
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
          setPrice(1000000000);
          toast.success("NFT listed to the marketpalce.");
        },
      },
    );
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="outline">List NFT</Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="300px">
        <Dialog.Title>List NFT</Dialog.Title>
        <TextField.Root
          type="number"
          placeholder="Default Price 1000000000"
          onChange={(e) =>
            setPrice(Number((e.target as HTMLInputElement).value))
          }
          disabled={isPending}
        />

        {status && isSuccess && (
          <Flex direction={"column"} gap={"2"} mt={"4"}>
            <Text>
              Status: <Badge color="green">{status}</Badge>
            </Text>
            <Text>NFT listed to the marketpalce.</Text>
          </Flex>
        )}

        <Flex gap={"2"} mt={"4"} justify={"end"}>
          <Dialog.Close>
            <Button variant="soft" color="gray" style={{ width: "80px" }}>
              Cancel
            </Button>
          </Dialog.Close>
          <Button
            style={{ width: "80px" }}
            onClick={listNFT}
            disabled={isPending}
          >
            {isPending ? <ClipLoader size={20} /> : "List"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
