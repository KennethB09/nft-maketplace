import { Box, Text, Flex } from "@radix-ui/themes";
import type { listingContent } from "../types/data";

type NFTInfoProps = {
  content: listingContent;
};

export default function ListedInfo({ content }: NFTInfoProps) {
  return (
    <Box>
      <Flex gap={"3"} direction={"column"}>
        <Flex direction={"column"} gap={"1"}>
          <Text style={{ fontWeight: "bold" }}>Seller</Text>
          <Text>{content.fields.seller}</Text>
        </Flex>

        <Flex direction={"column"} gap={"1"}>
          <Text style={{ fontWeight: "bold" }}>Price</Text>
          <Text>{content.fields.price}</Text>
        </Flex>
      </Flex>
    </Box>
  );
}
