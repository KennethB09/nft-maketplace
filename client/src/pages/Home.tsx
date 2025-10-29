import {
  Box,
  Dialog,
  Flex,
  Text,
  SegmentedControl,
  Skeleton,
} from "@radix-ui/themes";
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

type tabs = "your-nfts" | "your-listings" | "marketplace";

export default function Home() {
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();

  const [listings, setListings] = useState<nftsData[] | []>([]);
  const [userNFTs, setUserNFTs] = useState<userNftsData[] | []>([]);
  const [userListings, setUserListings] = useState<nftsData[] | []>([]);
  const [selected, setSelected] = useState<null | data>(null);
  const [selectedUserNft, setSelectedUserNft] = useState<null | nftData>(null);
  const [activeTab, setActiveTab] = useState<tabs>("your-nfts");
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    async function getUserObjects() {
      setLoading(true);

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
      setLoading(false);
    }

    async function getEvents() {
      setLoadingEvents(true);
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

      // Get the NFTs ID in filtered listings and get there object content.

      const getNFTsId = filteredListings.map((nftc) => nftc.listing_id);

      const getNFTsFields: any = await suiClient.multiGetObjects({
        ids: getNFTsId,
        options: {
          showContent: true,
        },
      });

      // Filter the listings of the user. Not efficient but it works.

      const listingOfUser: nftsData[] = getNFTsFields.filter(
        (i: nftsData) => i.data.content.fields.seller === account?.address,
      );

      setUserListings(listingOfUser);
      setListings(getNFTsFields);
      setLoadingEvents(false);
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

  return (
    <Flex gap={"4"} direction={"column"} height={"100vh"}>
      <Header />

      <SegmentedControl.Root
        style={{
          marginLeft: "15px",
          width: "min-content",
          height: "40px",
        }}
        defaultValue="your-nfts"
        onValueChange={(e) => setActiveTab(e as tabs)}
      >
        <SegmentedControl.Item value="your-nfts">
          Your NFTs
        </SegmentedControl.Item>
        <SegmentedControl.Item value="your-listings">
          Your Listing
        </SegmentedControl.Item>
        <SegmentedControl.Item value="marketplace">
          Marketplace
        </SegmentedControl.Item>
      </SegmentedControl.Root>

      {activeTab === "your-nfts" && (
        <Dialog.Root
          open={!!selectedUserNft}
          onOpenChange={(open) => {
            if (!open) setSelectedUserNft(null);
          }}
        >
          {selectedUserNft && (
            <UserNFTInfo data={selectedUserNft} close={onClickItem} />
          )}
          <Box px="4" py="2" height={"100%"}>
            <Flex
              wrap={"wrap"}
              width={"100%"}
              height={"100%"}
              overflowY={"scroll"}
              style={{ paddingTop: 4, gap: 5 }}
            >
              {!loading ? (
                userNFTs.length !== 0 ? (
                  userNFTs.map((nft) => (
                    <UserNFTCard
                      key={nft.data.objectId}
                      nftData={nft.data}
                      onClickItem={() => onClickItem("userNFT", nft.data)}
                    />
                  ))
                ) : (
                  <Flex
                    width={"100%"}
                    height={"100%"}
                    justify={"center"}
                    align={"center"}
                  >
                    <Text weight={"bold"}>
                      You have no NFTs. Mint a NFT first.
                    </Text>
                  </Flex>
                )
              ) : (
                "123456789"
                  .split("")
                  .map((s) => <Skeleton key={s} width="12rem" height="15rem" />)
              )}
            </Flex>
          </Box>
        </Dialog.Root>
      )}

      <Dialog.Root
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        {selected && <ListingNFTInfo data={selected} close={onClickItem} />}

        {activeTab === "your-listings" && (
          <Box px="4" py="2" height={"100%"}>
            <Flex
              wrap={"wrap"}
              width={"100%"}
              height={"100%"}
              overflowY={"scroll"}
              style={{ paddingTop: 4, gap: 5 }}
            >
              {!loadingEvents ? (
                userListings.length !== 0 ? (
                  userListings.map((nft) => (
                    <ListedCard
                      key={nft.data.objectId}
                      listingData={nft.data}
                      onClickItem={() => onClickItem("listingNFT", nft.data)}
                    />
                  ))
                ) : (
                  <Flex
                    width={"100%"}
                    height={"100%"}
                    justify={"center"}
                    align={"center"}
                  >
                    <Text weight={"bold"}>You have no listing.</Text>
                  </Flex>
                )
              ) : (
                "123456789"
                  .split("")
                  .map((s) => <Skeleton key={s} width="12rem" height="15rem" />)
              )}
            </Flex>
          </Box>
        )}

        {activeTab === "marketplace" && (
          <Box px="4" py="2" height={"100%"}>
            <Flex
              wrap={"wrap"}
              width={"100%"}
              height={"100%"}
              overflowY={"scroll"}
              style={{ paddingTop: 4, gap: 5 }}
            >
              {!loadingEvents ? (
                listings.length !== 0 ? (
                  listings.map((nft) => (
                    <ListedCard
                      key={nft.data.objectId}
                      listingData={nft.data}
                      onClickItem={() => onClickItem("listingNFT", nft.data)}
                    />
                  ))
                ) : (
                  <Flex
                    width={"100%"}
                    height={"100%"}
                    justify={"center"}
                    align={"center"}
                  >
                    <Text weight={"bold"}>The Marketplace is empty.</Text>
                  </Flex>
                )
              ) : (
                "123456789"
                  .split("")
                  .map((s) => <Skeleton key={s} width="12rem" height="15rem" />)
              )}
            </Flex>
          </Box>
        )}
      </Dialog.Root>
    </Flex>
  );
}
