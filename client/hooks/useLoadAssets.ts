import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Feather } from "@expo/vector-icons";

export function useLoadAssets() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [fontsLoaded] = useFonts({
    ...Feather.font,
  });

  useEffect(() => {
    if (fontsLoaded) {
      setAssetsLoaded(true);
    }
  }, [fontsLoaded]);

  return assetsLoaded;
}
