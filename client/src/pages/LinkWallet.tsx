import { Box, Flex, Heading } from "@radix-ui/themes";
import { ConnectButton } from "@mysten/dapp-kit";

export default function LinkWallet() {
  return (
    <Flex display={"flex"} justify={"center"} align={"center"} height={"100vh"}>
      <Flex gap={"4"} direction={"column"} justify={"center"} align={"center"}>
        <Heading>Link Slush</Heading>
        <ConnectButton />
      </Flex>
    </Flex>
  );
}
