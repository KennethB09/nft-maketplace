import { Box, Dialog, Flex, Heading, Text } from "@radix-ui/themes";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";
import { useEffect, useState } from "react";
import type { SuiEvent } from "@mysten/sui/client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import type {
  listing,
  data,
  nftData,
  nftsData,
  userNftsData,
} from "../types/data";
import Header from "../components/Header";
import ListingNFTInfo from "../components/ListingNFTInfo";
import ListedCard from "../components/ListingCard";
import UserNFTCard from "../components/UserNFTCard";
import UserNFTInfo from "../components/UserNFTInfo";

export default function Home() {
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();

  const [listings, setListings] = useState<nftsData[] | []>([]);
  const [userNFTs, setUserNFTs] = useState<userNftsData[] | []>([]);
  const [selected, setSelected] = useState<null | data>(null);
  const [selectedUserNft, setSelectedUserNft] = useState<null | nftData>(null);

  useEffect(() => {
    async function getUserObjects() {
      const response = await suiClient.getOwnedObjects({
        owner: account!.address,
        filter: {
          MoveModule: {
            package: `${import.meta.env.VITE_TEST_NET_OBJECT_ID}`,
            module: "nft_marketplace",
          },
        },
        options: {
          showType: true,
          showContent: true,
        },
      });

      const content: any = response.data.map((i) => i);

      setUserNFTs(content);
    }

    async function getEvents() {
      const listNFTEvent = await suiClient.queryEvents({
        query: {
          MoveEventType: `${packageId}::nft_marketplace::ListNFTEvent`,
        },
      });

      const listNFTEventParsed = listNFTEvent.data.map(
        (event: SuiEvent) => event.parsedJson as listing,
      );

      const delistNFTEvent = await suiClient.queryEvents({
        query: {
          MoveEventType: `${packageId}::nft_marketplace::DelistNFTEvent`,
        },
      });

      const delistNFTEventParsed = delistNFTEvent.data.map(
        (event: SuiEvent) => event.parsedJson as listing,
      );

      const purchaseNFTEvent = await suiClient.queryEvents({
        query: {
          MoveEventType: `${packageId}::nft_marketplace::PurchaseNFTEvent`,
        },
      });

      const purchaseNFTEventParsed = purchaseNFTEvent.data.map(
        (event: SuiEvent) => event.parsedJson as listing,
      );
      // console.log("list", listNFTEventParsed);
      // console.log("delist", delistNFTEventParsed);
      // console.log("purchased", purchaseNFTEventParsed);

      // Filter ListNFTEvent objects if it's in DelistNFTEvent or PurchaseNFTEvent.
      // Not efficient but it works.

      const delistedIds = new Set(
        delistNFTEventParsed.map((e) => e.listing_id),
      );
      const purchasedIds = new Set(
        purchaseNFTEventParsed.map((e) => e.listing_id),
      );

      const filteredListings: listing[] = listNFTEventParsed.filter(
        (nft) =>
          !delistedIds.has(nft.listing_id) && !purchasedIds.has(nft.listing_id),
      );

      const getNFTsId = filteredListings.map((nftc) => nftc.listing_id);
      // console.log(getNFTsId);

      const getNFTsFields: any = await suiClient.multiGetObjects({
        ids: getNFTsId,
        options: {
          showContent: true,
        },
      });

      setListings(getNFTsFields);
    }

    if (packageId && suiClient) {
      getUserObjects();
      getEvents();
    }
  }, [packageId, suiClient]);

  function onClickItem(type: "userNFT" | "listingNFT", data?: any) {
    if (!data) {
      setSelected(null);
      setSelectedUserNft(null);
      return;
    }

    if (type === "listingNFT") {
      setSelected(data);
    } else {
      setSelectedUserNft(data);
    }
    return;
  }

  // console.log(
  //   "user",
  //   userNFTs.map((t) => t),
  // );
  // console.log(
  //   "listing",
  //   listings.map((t) => t.data),
  // );

  return (
    <Box>
      <Header />

      <Dialog.Root
        open={!!selectedUserNft}
        onOpenChange={(open) => {
          if (!open) setSelectedUserNft(null);
        }}
      >
        {selectedUserNft && (
          <UserNFTInfo data={selectedUserNft} close={onClickItem} />
        )}
        <Box px="4" py="2">
          <Heading>Your NFTs</Heading>
          <Flex wrap={"wrap"} width={"100%"} style={{ paddingTop: 4, gap: 5 }}>
            {userNFTs.map((nft) => (
              <UserNFTCard
                key={nft.data.objectId}
                nftData={nft.data}
                onClickItem={() => onClickItem("userNFT", nft.data)}
              />
            ))}
          </Flex>
        </Box>
      </Dialog.Root>

      <Box px="4" py="2">
        <Heading>Listed NFTs</Heading>
        <Dialog.Root
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        >
          {selected && <ListingNFTInfo data={selected} close={onClickItem} />}
          <Box style={{ paddingTop: 4 }}>
            {listings.length !== 0 ? (
              listings.map((nft) => (
                <ListedCard
                  key={nft.data.objectId}
                  listingData={nft.data}
                  onClickItem={() => onClickItem("listingNFT", nft.data)}
                />
              ))
            ) : (
              <Text>Loading</Text>
            )}
          </Box>
        </Dialog.Root>
      </Box>
    </Box>
  );
}
