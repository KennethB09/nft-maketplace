import { Box, Dialog, Flex, Heading } from "@radix-ui/themes";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";
import { useEffect, useState } from "react";
import type { SuiEvent } from "@mysten/sui/client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import type { listing, data, listedNFTs } from "../types/data";
import Header from "../components/Header";
import NFTInfo from "../components/NFTInfo";
import ListedCard from "../components/ListingCard";

export default function Home() {
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();

  const [listings, setListings] = useState<listedNFTs[] | []>([]);
  const [userNFTs, setUserNFTs] = useState<listedNFTs[] | []>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<null | listedNFTs>(null);

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

      const content: any = response.data.map((i) => i.data);

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

      // console.log(filteredListings);
      const getNFTsId = filteredListings.map((nftc) => nftc.nft_id);

      const getNFTsFields = await suiClient.multiGetObjects({
        ids: getNFTsId,
        options: {
          showContent: true,
        },
      });

      let combinedData: listedNFTs[] = [];

      for (let i = 0; filteredListings.length > i; i++) {
        for (let f = 0; getNFTsFields.length > f; f++) {
          if (filteredListings[i].nft_id === getNFTsFields[f].data?.objectId) {
            const newData: listedNFTs = {
              ...filteredListings[i],
              ...(getNFTsFields[f].data as any),
            };
            combinedData = [...combinedData, newData];
          }
        }
      }
      console.log(combinedData);

      setListings(combinedData);
    }

    if (packageId && suiClient) {
      getUserObjects();
      getEvents();
    }
  }, [packageId, suiClient]);

  function onClickItem(data?: listedNFTs) {
    if (dialogOpen) {
      setDialogOpen((prev) => !prev);
      setSelected(null);
      return;
    }

    if (data) {
      setSelected(data);
      setDialogOpen((prev) => !prev);
    }
    return;
  }

  return (
    <Box>
      <Dialog.Root open={dialogOpen}>
        {selected && <NFTInfo data={selected} close={onClickItem} />}
      </Dialog.Root>
      <Header />
      <Box px="4" py="2">
        <Heading>Your NFTs</Heading>
        <Flex wrap={"wrap"} width={"100%"} style={{ paddingTop: 4, gap: 5 }}>
          {userNFTs.map((nft) => (
            <ListedCard
              key={nft.objectId}
              nft={nft}
              onClickItem={onClickItem}
            />
          ))}
        </Flex>
      </Box>

      <Box px="4" py="2">
        <Heading>Listed NFTs</Heading>
        <Box style={{ paddingTop: 4 }}>
          {listings.map((nft) => (
            <ListedCard
              key={nft.objectId}
              nft={nft}
              onClickItem={onClickItem}
            />
            // <Box
            //   key={nft.listing_id}
            //   style={{
            //     border: "2px solid gray",
            //     borderRadius: 8,
            //     padding: 12,
            //     marginBottom: 12,
            //     width: "30rem",
            //   }}
            // >
            //   <Flex direction={"column"}>
            //     <Text>
            //       <Text style={{ fontWeight: "600" }}>Listing ID</Text>{" "}
            //       {nft.listing_id}
            //     </Text>
            //     <Text>
            //       <Text style={{ fontWeight: "600" }}>NFT ID</Text> {nft.nft_id}
            //     </Text>
            //     <Text>
            //       <Text style={{ fontWeight: "600" }}>Seller</Text> {nft.seller}
            //     </Text>
            //     <Text>
            //       <Text style={{ fontWeight: "600" }}>Price</Text> {nft.price}
            //     </Text>
            //   </Flex>
            // </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
