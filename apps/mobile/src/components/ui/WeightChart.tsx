import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import type { WeightEntry } from '@pawflo/types';
import { Colors, Fonts, FontSize } from '@pawflo/theme';

type Props = {
  entries: WeightEntry[];
  width: number;
  height?: number;
};

const PAD = { top: 12, right: 12, bottom: 24, left: 36 };

export function WeightChart({ entries, width, height = 120 }: Props) {
  if (entries.length < 2) {
    return (
      <View style={[styles.placeholder, { width, height }]}>
        <Text style={styles.placeholderText}>
          {entries.length === 0
            ? 'Brak pomiarów'
            : 'Dodaj kolejny pomiar, aby zobaczyć wykres'}
        </Text>
      </View>
    );
  }

  const chartW = width - PAD.left - PAD.right;
  const chartH = height - PAD.top - PAD.bottom;

  const weights = entries.map((e) => e.weightKg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const rangeW = maxW - minW || 1;

  const points = entries.map((e, i) => {
    const x = PAD.left + (i / (entries.length - 1)) * chartW;
    const y = PAD.top + chartH - ((e.weightKg - minW) / rangeW) * chartH;
    return { x, y, weight: e.weightKg, date: e.date };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Show 3 Y-axis labels: min, mid, max
  const yLabels = [
    { value: maxW, y: PAD.top },
    { value: (minW + maxW) / 2, y: PAD.top + chartH / 2 },
    { value: minW, y: PAD.top + chartH },
  ];

  return (
    <Svg width={width} height={height}>
      {/* Y-axis gridlines + labels */}
      {yLabels.map((label, i) => (
        <Line
          key={i}
          x1={PAD.left}
          y1={label.y}
          x2={width - PAD.right}
          y2={label.y}
          stroke="rgba(229,219,197,0.1)"
          strokeWidth={1}
        />
      ))}
      {yLabels.map((label, i) => (
        <SvgText
          key={i}
          x={PAD.left - 6}
          y={label.y + 4}
          fontSize={9}
          fill={Colors.textFaint}
          textAnchor="end"
          fontFamily={Fonts.sans}
        >
          {label.value.toFixed(1)}
        </SvgText>
      ))}

      {/* Line */}
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={Colors.coral}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {points.map((p, i) => (
        <Circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill={Colors.coral}
          stroke={Colors.ink}
          strokeWidth={1.5}
        />
      ))}

      {/* X-axis labels — first and last only */}
      {[points[0], points[points.length - 1]].map((p, i) =>
        p ? (
          <SvgText
            key={i}
            x={p.x}
            y={height - 4}
            fontSize={9}
            fill={Colors.textFaint}
            textAnchor={i === 0 ? 'start' : 'end'}
            fontFamily={Fonts.sans}
          >
            {formatDateShort(p.date)}
          </SvgText>
        ) : null,
      )}
    </Svg>
  );
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.textFaint,
    textAlign: 'center',
  },
});
