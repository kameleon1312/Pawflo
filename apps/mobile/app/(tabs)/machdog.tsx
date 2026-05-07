import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, FontSize } from '@pawflo/theme';

// TODO: implement SwipeCard deck (MachDog feature)
export default function MachdogScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Text style={styles.title}>MachDog</Text>
        <Text style={styles.subtitle}>Dopasowania — wkrótce</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.ink },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: Fonts.serif, fontSize: FontSize.h1, color: Colors.coral },
  subtitle: { fontFamily: Fonts.sans, fontSize: FontSize.body, color: Colors.textFaint, marginTop: 8 },
});
