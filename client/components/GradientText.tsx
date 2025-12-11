import React from 'react';
import {
  Text,
  StyleSheet,
  type TextProps,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientTextProps extends TextProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export function GradientText({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  ...props
}: GradientTextProps) {
  return (
    <MaskedView
      style={styles.maskedView}
      maskElement={<Text style={[style, styles.maskElement]} {...props} />}
    >
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={styles.gradient}
      >
        <Text style={[style, styles.text]} {...props} />
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  maskedView: {
    flexDirection: 'row',
  },
  maskElement: {
    backgroundColor: 'transparent',
  },
  gradient: {
    flex: 1,
  },
  text: {
    opacity: 0,
  },
});
