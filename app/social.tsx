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
 
    <SafeAreaView className='flex-1 justify-start p-6 gap-6 bg-transparent'>


      <View className="gap-2">
        <Text className="text-xs font-bold uppercase tracking-widest ml-1">Profile Handle</Text>
        <Input 
          value={handle} 
          onChangeText={setHandle} 
          placeholder="@username"
          className="bg-white/10 border-white/20 text-white h-14 rounded-xl px-4"
        />
      </View>


      <Button onPress={handlePress} disabled={isGenerating}>
        <Text>Import Profile</Text>
  
      </Button>
      
      <View className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-4">
        <Textarea value={starter} className="text-white text-lg" />
      </View>
    </SafeAreaView>
  );
}