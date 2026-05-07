import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, FontSize } from '@pawflo/theme';

// TODO: implement PawPanel health dashboard
export default function PawPanelScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Text style={styles.title}>PawPanel</Text>
        <Text style={styles.subtitle}>Panel zdrowia — wkrótce</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.ink },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: Fonts.serif, fontSize: FontSize.h1, color: Colors.cream },
  subtitle: { fontFamily: Fonts.sans, fontSize: FontSize.body, color: Colors.textFaint, marginTop: 8 },
});
