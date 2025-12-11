import React from 'react';
import { StyleSheet, View, type TextStyle, type StyleProp } from 'react-native';
import Svg, { Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

interface GradientTextProps {
  children: string;
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: StyleProp<TextStyle>;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
}

export function GradientText({
  children,
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  fontSize = 24,
  fontFamily = 'Orbitron_700Bold',
  fontWeight = 'bold',
}: GradientTextProps) {
  const flatStyle = StyleSheet.flatten(style) || {};
  const textFontSize = flatStyle.fontSize || fontSize;
  const textFontFamily = flatStyle.fontFamily || fontFamily;
  const textFontWeight = flatStyle.fontWeight || fontWeight;

  const height = (textFontSize as number) * 1.3;
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <View style={styles.container}>
      <Svg height={height} style={styles.svg}>
        <Defs>
          <LinearGradient
            id={gradientId}
            x1={`${start.x * 100}%`}
            y1={`${start.y * 100}%`}
            x2={`${end.x * 100}%`}
            y2={`${end.y * 100}%`}
          >
            {colors.map((color, index) => (
              <Stop
                key={index}
                offset={`${(index / (colors.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </LinearGradient>
        </Defs>
        <SvgText
          fill={`url(#${gradientId})`}
          fontSize={textFontSize}
          fontFamily={textFontFamily}
          fontWeight={textFontWeight}
          x="0"
          y={textFontSize as number}
        >
          {children}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  svg: {
    flexShrink: 1,
  },
});
