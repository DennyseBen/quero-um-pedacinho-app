import { Slot } from 'expo-router';
import { CartProvider } from '../src/contexts/CartContext';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../src/theme';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <CartProvider>
                    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
                        <StatusBar style="dark" backgroundColor={COLORS.background} />
                        <Slot />
                    </View>
                </CartProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
