import {
  Box,
  Button,
  Container,
  Dialog,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import { useDisconnectWallet } from "@mysten/dapp-kit";
import Mint from "../components/Mint";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";
import { useEffect, useState } from "react";
import type { SuiEvent } from "@mysten/sui/client";
import EditDescription from "../components/EditDescription";

type listing = {
  listing_id: string;
  nft_id: string;
  seller: string;
  price: number;
};

export default function Home() {
  const { mutate: disconnect } = useDisconnectWallet();
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();
  const [removedListing, setRemoveListing] = useState<listing[] | []>([]);
  const [addedListings, setAddedListings] = useState<listing[] | []>([]);
  let listings: listing[] = addedListings.filter(
    (nft) =>
      !removedListing.map((nft) => nft.listing_id).includes(nft.listing_id),
  );

  useEffect(() => {
    async function getListings() {
      const response = await suiClient.queryEvents({
        query: {
          MoveEventType: `${packageId}::nft_marketplace::ListNFTEvent`,
        },
      });
      const parsed = response.data.map(
        (event: SuiEvent) => event.parsedJson as listing,
      );
      setAddedListings(parsed ?? []);
    }

    async function getRemoveListings() {
      const response = await suiClient.queryEvents({
        query: {
          MoveEventType: `${packageId}::nft_marketplace::DelistNFTEvent`,
        },
      });
      const parsed = response.data.map(
        (event: SuiEvent) => event.parsedJson as listing,
      );
      setRemoveListing(parsed ?? []);
    }

    if (packageId && suiClient) getListings();
    getRemoveListings();
  }, [packageId, suiClient]);

  return (
    <Box>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>Home</Heading>
        </Box>

        <Box>
          <Button onClick={() => disconnect()}>Disconnect Wallet</Button>
        </Box>
      </Flex>
      <Flex style={{ padding: 12, gap: 10 }}>
        <Dialog.Root>
          <Dialog.Trigger>
            <Button>Mint NFT</Button>
          </Dialog.Trigger>
          <Mint />
        </Dialog.Root>
        <Dialog.Root>
          <Dialog.Trigger>
            <Button>Edit NFT</Button>
          </Dialog.Trigger>
          <EditDescription />
        </Dialog.Root>
      </Flex>
      <Container style={{ padding: 4 }}>
        {listings.map((nft) => (
          <Container
            key={nft.listing_id}
            style={{
              border: "2px solid gray",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              width: "30rem",
            }}
          >
            <Flex direction={"column"}>
              <Text>
                <Text style={{ fontWeight: "600" }}>Listing ID</Text>{" "}
                {nft.listing_id}
              </Text>
              <Text>
                <Text style={{ fontWeight: "600" }}>NFT ID</Text> {nft.nft_id}
              </Text>
              <Text>
                <Text style={{ fontWeight: "600" }}>Seller</Text> {nft.seller}
              </Text>
              <Text>
                <Text style={{ fontWeight: "600" }}>Price</Text> {nft.price}
              </Text>
            </Flex>
          </Container>
        ))}
      </Container>
    </Box>
  );
}
