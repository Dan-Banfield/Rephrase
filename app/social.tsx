import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { useNavigation } from 'expo-router';
import { Settings, X, Repeat } from 'lucide-react-native';
import { getBio } from '@/services/get_bio';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ScrollView,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';

import { MessageSquare, Users, ThumbsUp, Share2, Plus } from 'lucide-react-native';
import { Textarea } from '@/components/ui/textarea';
import { generateMessage, generateStarter } from '@/services/ai';

type SocialPost = {
  id: string;
  username: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
  isLiked: boolean;
};

export default function SocialScreen() {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();

  const [handle, setHandle] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [starter, setStarter] = React.useState(''); 
  

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Social Feed',
    });
  }, [navigation]);

  const handlePress = async () => {
    setIsGenerating(true);
    try {
      const bio = await getBio(handle);
      const starter = await generateStarter(bio);
      setStarter(starter);
      console.log(starter);
    } catch (error) {
      console.error("Error:", error);
    }
    finally{
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 justify-start p-4 gap-4'>
      <Textarea value={handle} onChangeText={setHandle}/>

      <Button onPress={handlePress} disabled={isGenerating} className='h-14 rounded-2xl shadow-lg'>
        {isGenerating ? (
                           <View className="flex-row items-center justify-center gap-2">
                              <ActivityIndicator color="white" />
                              <Text className="text-white">Generating...</Text>
                           </View>
                        ) : (
                           <Text>
                             Suggest a conversation starter!
                           </Text>
                        )}
      </Button>

      <Textarea value={starter} editable={false}></Textarea>
    </SafeAreaView>
  );
}