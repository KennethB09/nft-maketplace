import { Box, Text, Flex, Dialog, Button } from "@radix-ui/themes";

import type { data } from "../types/data";

import CancelListing from "./CancelListing";

import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";
import { toast } from "sonner";
import { useCurrentAccount } from "@mysten/dapp-kit";
import ListedInfo from "./ListedInfo";

type ListingNFTInfoProps = {
  data: data;
  close: (type: "userNFT" | "listingNFT") => void;
};

export default function ListingNFTInfo({ data, close }: ListingNFTInfoProps) {
  const user = useCurrentAccount();
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  async function buyNFT() {
    const tx = new Transaction();

    const [coin] = tx.splitCoins(tx.gas, [
      tx.pure.u64(data.content.fields.price),
    ]);

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
          toast.success("You successfully bought this NFT.");
        },
      },
    );
  }

  return (
    <Dialog.Content
      maxHeight={{ initial: "100vh", sm: "fit-content" }}
      maxWidth={{ initial: "100vw", sm: "550px" }}
      style={{ padding: "0" }}
    >
      <Flex
        direction={"row"}
        justify={"between"}
        p={"3"}
        style={{
          borderBottom: "2px solid var(--gray-a2)",
        }}
      >
        <Dialog.Title mb={"0"}>Description</Dialog.Title>
        <Button variant="ghost" onClick={() => close("listingNFT")}>
          X
        </Button>
      </Flex>
      <Flex gap={"2"} direction={{ initial: "column", sm: "row" }}>
        <Box overflow={"hidden"} width={{ initial: "100%", sm: "50%" }}>
          <img
            src={data.content.fields.nft.fields.url}
            style={{ objectFit: "cover" }}
            width={"100%"}
          />
        </Box>

        <Flex
          direction={"column"}
          width={{ initial: "100%", sm: "50%" }}
          py={{ initial: "3", sm: "0" }}
          gap={"2"}
          style={{
            borderLeft: "2px solid var(--gray-a2)",
          }}
        >
          {user?.address === data.content.fields.seller && (
            <Flex gap={"2"} mx={"3"} pt={{ initial: "0", sm: "3" }}>
              <CancelListing objectId={data.objectId} />
            </Flex>
          )}

          <Flex direction={"column"} px={"3"} gap={"3"}>
            <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
              {data.content.fields.nft.fields.name}
            </Text>
            <Text>{data.content.fields.nft.fields.description}</Text>
            <ListedInfo content={data.content} />
          </Flex>

          {user?.address !== data.content.fields.seller && (
            <Box px={"3"} mt={"auto"} mb={"3"}>
              <Button
                onClick={buyNFT}
                disabled={isPending}
                style={{ width: "100%" }}
              >
                Buy NFT
              </Button>
            </Box>
          )}
        </Flex>
      </Flex>
    </Dialog.Content>
  );
}
