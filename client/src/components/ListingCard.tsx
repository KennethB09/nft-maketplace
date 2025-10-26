import { Box, Flex, Text } from "@radix-ui/themes";
import { listedNFTs } from "../types/data";

type ListedCardProps = {
    nft: listedNFTs;
    onClickItem: (param: listedNFTs) => void;
}

export default function ListedCard({ nft, onClickItem }: ListedCardProps) {
  return (
    <Box
      key={nft.objectId}
      style={{
        border: "2px solid var(--gray-a2)",
        borderRadius: 8,
        width: "12rem",
        height: "15rem",
        overflow: "hidden",
      }}
      onClick={() => onClickItem(nft)}
    >
      <Box height={"65%"} overflow={"hidden"}>
        <img
          src={nft.content.fields.url}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
          }}
        />
      </Box>
      <Flex direction={"column"} p={"2"}>
        <Text style={{ fontWeight: "600" }}>
          {nft.content.fields.name}
        </Text>
        <Text size={"1"}>{nft.content.fields.description}</Text>
      </Flex>
    </Box>
  );
}
