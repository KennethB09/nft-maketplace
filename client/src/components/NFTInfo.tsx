import { Box, Text, Flex, Dialog, Button } from "@radix-ui/themes";

import type { listedNFTs } from "../types/data";

import EditDescription from "../components/EditDescription";
import BurnNFT from "./BurnNFT";
import ListNFT from "./ListNFT";
import CancelListing from "./CancelListing";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";

type NFTInfoProps = {
  data: listedNFTs;
  close: () => void;
};

export default function NFTInfo({ data, close }: NFTInfoProps) {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const userBalance = suiClient.getBalance({
    owner: account?.address!
  });
  const packageId = useNetworkVariable("packageId");
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  async function buyNFT() {
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::nft_marketplace::buy_nft`,
      arguments: [tx.object(data.listing_id), tx.object((await userBalance).totalBalance), tx.pure.string(`${import.meta.env.VITE_MARKETPLACE_OBJECT_ID}`)],
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

          {!data.listing_id ? (
            <Flex gap={"2"}>
              <ListNFT objectId={data.objectId} />

              <EditDescription objectId={data.objectId} />

              <BurnNFT objectId={data.objectId} />
            </Flex>
          ) : (
            data.seller === account!.address && (
              <CancelListing objectId={data.objectId} />
            )
          )}

          <Flex direction={"column"}>
            <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
              {data.content.fields.name}
            </Text>
            <Text>{data.content.fields.description}</Text>
          </Flex>

          {data.listing_id && (
            <Box onClick={buyNFT}>
              <Button style={{ width: "100%" }}>Buy NFT</Button>
            </Box>
          )}
        </Flex>
      </Flex>
    </Dialog.Content>
  );
}
