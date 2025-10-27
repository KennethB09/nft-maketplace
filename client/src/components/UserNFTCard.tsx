import { Box, Flex, Text } from "@radix-ui/themes";
import { nftData } from "../types/data";

type UserNFTCardProps = {
  nftData: nftData;
  onClickItem: (param: nftData) => void;
};

export default function UserNFTCard({ nftData, onClickItem }: UserNFTCardProps) {
  return (
    <Box
      key={nftData.objectId}
      style={{
        border: "2px solid var(--gray-a2)",
        borderRadius: 8,
        width: "12rem",
        height: "15rem",
        overflow: "hidden",
      }}
      onClick={() => onClickItem(nftData)}
    >
      <Box height={"65%"} overflow={"hidden"}>
        <img
          src={nftData.content.fields.url}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
          }}
        />
      </Box>
      <Flex direction={"column"} p={"2"}>
        <Text style={{ fontWeight: "600" }}>
          {nftData.content.fields.name}
        </Text>
        <Text size={"1"}>
          {nftData.content.fields.description}
        </Text>
      </Flex>
    </Box>
  );
}
