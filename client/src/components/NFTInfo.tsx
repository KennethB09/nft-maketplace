import {
  Box,
  Text,
  Flex,
  Dialog,
  Button,
  TextField,
  AlertDialog,
} from "@radix-ui/themes";
import type { data } from "../types/data";
import { Transaction } from "@mysten/sui/transactions";
import ClipLoader from "react-spinners/ClipLoader";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";
import EditDescription from "../components/EditDescription";
import { useState } from "react";

type NFTInfoProps = {
  data: data;
  close: () => void;
};

export default function NFTInfo({ data, close }: NFTInfoProps) {
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
      arguments: [tx.object(data.objectId), tx.pure.u64(price)],
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

  function burnNFT() {
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::nft_marketplace::burn_nft`,
      arguments: [tx.object(data.objectId)],
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
    <Dialog.Content maxWidth="450px" style={{ padding: "0" }}>
      <Flex gap={"2"}>
        <Box overflow={"hidden"} width={"50%"}>
          <img
            src={data.content.fields.url}
            style={{ objectFit: "cover" }}
            width={"100%"}
          />
        </Box>
        <Flex direction={"column"} width={"100%"} p={"3"} gap={"2"}>
          <Flex direction={"row"} justify={"between"}>
            <Dialog.Title>Description</Dialog.Title>
            <Button variant="ghost" onClick={close}>
              X
            </Button>
          </Flex>
          <Flex gap={"2"}>
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
                    <Button
                      variant="soft"
                      color="gray"
                      style={{ width: "80px" }}
                    >
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

            <Dialog.Root>
              <Dialog.Trigger>
                <Button variant="outline">Edit NFT</Button>
              </Dialog.Trigger>
              <EditDescription objectId={data.objectId} />
            </Dialog.Root>

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
          </Flex>
          <Flex direction={"column"}>
            <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
              {data.content.fields.name}
            </Text>
            <Text>{data.content.fields.description}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Dialog.Content>
  );
}
