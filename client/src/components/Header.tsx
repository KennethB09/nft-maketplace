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
      gap={"3"}
      align={"center"}
      style={{
        borderBottom: "2px solid var(--gray-a2)",
      }}
    >
      <Box display={{initial: "none", md: "block"}}>
        <Heading>NFT Marketplace</Heading>
      </Box>

      <Flex justify={{ initial: "end", sm: "start" }} direction={{ initial: "row-reverse", sm: "row" }} gap={"4"} align={"center"} wrap={"wrap"}>
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
