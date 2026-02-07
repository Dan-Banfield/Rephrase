import { Link } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-2xl font-bold mb-4">Oops!</Text>
      <Text className="text-lg mb-6">This screen doesn't exist.</Text>
      <Link href="/">
        <Text className="text-blue-500 text-lg">Go to home screen!</Text>
      </Link>
    </View>
  );
}