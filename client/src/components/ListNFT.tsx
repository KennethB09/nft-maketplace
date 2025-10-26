import {
  Flex,
  Dialog,
  TextField,
  Button,
} from "@radix-ui/themes";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import ClipLoader from "react-spinners/ClipLoader";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";

type ListNFTProps = {
  objectId: string;
};

export default function ListNFT({ objectId }: ListNFTProps) {
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();

  const [price, setPrice] = useState<number>(1000000000);

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
        },
      },
    );
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="outline">List NFT</Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="250px">
        <Dialog.Title>List NFT</Dialog.Title>
        <TextField.Root
          type="number"
          placeholder="Default Price 1000000000"
          onChange={(e) =>
            setPrice(Number((e.target as HTMLInputElement).value))
          }
        />
        <Flex gap={"2"} mt={"4"} justify={"end"}>
          <Dialog.Close>
            <Button variant="soft" color="gray" style={{ width: "80px" }}>
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              style={{ width: "80px" }}
              onClick={listNFT}
              disabled={isPending}
            >
              {isPending ? <ClipLoader size={20} /> : "List"}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
