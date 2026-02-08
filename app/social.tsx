import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { useNavigation } from 'expo-router';
import { Settings, X, Repeat } from 'lucide-react-native';

import {
  ScrollView,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';

import { MessageSquare, Users, ThumbsUp, Share2, Plus } from 'lucide-react-native';

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
  

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Social Feed',
    });
  }, [navigation]);
}