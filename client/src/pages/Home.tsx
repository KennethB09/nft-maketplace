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
import { useCurrentAccount } from "@mysten/dapp-kit";

type listing = {
  listing_id: string;
  nft_id: string;
  seller: string;
  price: number;
};

type Tcontent = {
  dataType: string;
  fields: {
    description: string;
    name: string;
    url: string;
  };
};

type data = {
  digest: string;
  objectId: string;
  type: string;
  version: string;
  content: Tcontent;
};

type nftsData = {
  data: data;
};

export default function Home() {
  const { mutate: disconnect } = useDisconnectWallet();
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();
  const [removedListing, setRemoveListing] = useState<listing[] | []>([]);
  const [addedListings, setAddedListings] = useState<listing[] | []>([]);
  const [userNFTs, setUserNFTs] = useState<nftsData[] | []>([]);

  let listings: listing[] = addedListings.filter(
    (nft) =>
      !removedListing.map((nft) => nft.listing_id).includes(nft.listing_id),
  );

  useEffect(() => {
    async function getUserObjects() {
      const response = await suiClient.getOwnedObjects({
        owner: account!.address,
        filter: {
          MoveModule: {
            package:
              "0x5760c8a0597227e9442c5be3b8d1ff4b8327e1c79acb0dd7afec08bcf4cc233b",
            module: "nft_marketplace",
          },
        },
        options: {
          showType: true,
          showContent: true,
        },
      });

      const content: any = response.data;
      setUserNFTs(content);
    }

    // async function getMarketplaceObjects() {
    //   const response = await suiClient.getOwnedObjects({
    //     owner: "",
    //     filter: {
    //       MoveModule: {
    //         package:
    //           "0x5760c8a0597227e9442c5be3b8d1ff4b8327e1c79acb0dd7afec08bcf4cc233b",
    //         module: "nft_marketplace",
    //       },
    //     },
    //     options: {
    //       showType: true,
    //       showContent: true,
    //     },
    //   });
    // }

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

    if (packageId && suiClient) {
      getUserObjects();
      getListings();
      getRemoveListings();
    }
  }, [packageId, suiClient]);

  // console.log(userNFTs.map(n => n.data.objectId))

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
      <Box px="4" py="2">
        <Heading>Your NFTs</Heading>
        <Flex wrap={"wrap"} width={"100%"} style={{ paddingTop: 4, gap: 5 }}>
          {userNFTs.map((nft) => (
            <Box
              key={nft.data.objectId}
              style={{
                border: "2px solid var(--gray-a2)",
                borderRadius: 8,
                width: "12rem",
                height: "15rem",
                overflow: "hidden"
              }}
            >
              <Box height={"65%"} overflow={"hidden"}>
                <img
                  src={nft.data.content.fields.url}
                  style={{ width: "100%", height: "auto", objectFit: "cover" }}
                />
              </Box>
              <Flex direction={"column"} p={"2"}>
                <Text style={{ fontWeight: "600" }}>
                  {nft.data.content.fields.name}
                </Text>
                <Text size={"1"}>{nft.data.content.fields.description}</Text>
              </Flex>
            </Box>
          ))}
        </Flex>
      </Box>
      <Box px="4" py="2">
        <Heading>Listed NFTs</Heading>
        <Box style={{ paddingTop: 4 }}>
          {listings.map((nft) => (
            <Box
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
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
