import { Box, Flex, Heading } from "@radix-ui/themes";
import { ConnectButton } from "@mysten/dapp-kit";

export default function LinkWallet() {
  return (
    <Flex display={"flex"} justify={"center"} align={"center"} height={"100vh"}>
      <Box>
        <Heading>Link Slush</Heading>
        <ConnectButton />
      </Box>
    </Flex>
  );
}
