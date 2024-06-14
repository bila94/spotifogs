import { Button, useColorMode } from "@chakra-ui/react";

const ThemeSwitchButton = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const emoji = colorMode === "light" ? "🌚" : "🌞";
    const ariaLabel =
      colorMode === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <Button
      onClick={toggleColorMode}
      aria-label={ariaLabel}
      variant="ghost"
      fontSize="24px"
    >
      {emoji}
    </Button>
  );
};

export default ThemeSwitchButton;