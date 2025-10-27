import { Flex, Box, Heading, Button, Dialog } from "@radix-ui/themes";
import { useDisconnectWallet } from "@mysten/dapp-kit";
import Mint from "../components/Mint";
import WithdrawFees from "./WithdrawFees";

export default function Header() {
  const { mutate: disconnect } = useDisconnectWallet();
  return (
    <Flex
      position="sticky"
      px="4"
      py="2"
      justify="between"
      style={{
        borderBottom: "1px solid var(--gray-a2)",
      }}
    >
      <Box>
        <Heading>NFT Marketplace</Heading>
      </Box>

      <Box>
        <Dialog.Root>
          <Dialog.Trigger>
            <Button>Mint NFT</Button>
          </Dialog.Trigger>
          <Mint />
        </Dialog.Root>
      </Box>

      <WithdrawFees />

      <Box>
        <Button variant="surface" onClick={() => disconnect()}>
          Disconnect Wallet
        </Button>
      </Box>
    </Flex>
  );
}
