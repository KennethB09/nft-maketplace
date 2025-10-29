import { Flex, Box, Heading, Button, Dialog } from "@radix-ui/themes";
import Mint from "../components/Mint";
import WithdrawFees from "./WithdrawFees";
import { ConnectButton } from "@mysten/dapp-kit";

export default function Header() {
  return (
    <Flex
      position="sticky"
      px="4"
      py="2"
      justify="between"
      align={"center"}
      style={{
        borderBottom: "2px solid var(--gray-a2)",
      }}
    >
      <Box>
        <Heading>NFT Marketplace</Heading>
      </Box>

      <Flex gap={"4"} align={"center"}>
        <Dialog.Root>
          <Dialog.Trigger>
            <Button>Mint NFT</Button>
          </Dialog.Trigger>
          <Mint />
        </Dialog.Root>
        <WithdrawFees />
      </Flex>

      <Box>
        <ConnectButton />
      </Box>
    </Flex>
  );
}
