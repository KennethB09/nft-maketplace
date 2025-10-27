import { Box, Text, Flex, Dialog, Button } from "@radix-ui/themes";

import type { data } from "../types/data";

import CancelListing from "./CancelListing";

import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";

type ListingNFTInfoProps = {
  data: data;
  close: (type: "userNFT" | "listingNFT") => void;
};

export default function ListingNFTInfo({ data, close }: ListingNFTInfoProps) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  async function buyNFT() {
    const tx = new Transaction();

    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(data.content.fields.price)]);

    tx.moveCall({
      target: `${packageId}::nft_marketplace::buy_nft`,
      arguments: [
        tx.object(data.objectId),
        coin,
        tx.object(import.meta.env.VITE_MARKETPLACE_OBJECT_ID),
      ],
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
            src={data.content.fields.nft.fields.url}
            style={{ objectFit: "cover" }}
            width={"100%"}
          />
        </Box>

        <Flex direction={"column"} width={"100%"} p={"3"} gap={"2"}>
          <Flex direction={"row"} justify={"between"}>
            <Dialog.Title>Description</Dialog.Title>
            <Button variant="ghost" onClick={() => close("listingNFT")}>
              X
            </Button>
          </Flex>

          <Flex gap={"2"}>
            <CancelListing objectId={data.objectId} />
          </Flex>

          <Flex direction={"column"}>
            <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
              {data.content.fields.nft.fields.name}
            </Text>
            <Text>{data.content.fields.nft.fields.description}</Text>
          </Flex>

          <Box onClick={buyNFT}>
            <Button style={{ width: "100%" }}>Buy NFT</Button>
          </Box>
        </Flex>
      </Flex>
    </Dialog.Content>
  );
}
