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
  const [newPost, setNewPost] = React.useState('');
  const [posts, setPosts] = React.useState<SocialPost[]>([
    {
      id: '1',
      username: 'Alex Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      content: 'Just finished the new rephrase feature! Excited to see how it helps with communication. 🚀',
      likes: 42,
      comments: 8,
      time: '2h ago',
      isLiked: false,
    },
    {
      id: '2',
      username: 'Sam Rivera',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
      content: 'The professional rephrase option saved me during an important client email today. Highly recommend!',
      likes: 28,
      comments: 5,
      time: '5h ago',
      isLiked: true,
    },
    {
      id: '3',
      username: 'Taylor Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor',
      content: 'Casual mode made my message to friends sound so much more natural. Love this app!',
      likes: 15,
      comments: 3,
      time: '1d ago',
      isLiked: false,
    },
    {
      id: '4',
      username: 'Jordan Lee',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
      content: 'Using the technical rephrase for documentation. Makes complex topics much clearer.',
      likes: 9,
      comments: 2,
      time: '2d ago',
      isLiked: false,
    },
  ]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Social Feed',
    });
  }, [navigation]);

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
  };

  const handleAddPost = () => {
    if (newPost.trim().length === 0) {
      Alert.alert('Empty Post', 'Please write something to post.');
      return;
    }

    const newPostObj: SocialPost = {
      id: Date.now().toString(),
      username: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      content: newPost,
      likes: 0,
      comments: 0,
      time: 'Just now',
      isLiked: false,
    };

    setPosts([newPostObj, ...posts]);
    setNewPost('');
  };

  const renderPost = ({ item }: { item: SocialPost }) => (
    <View className="bg-card rounded-xl p-4 mb-4 border border-border">
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: item.avatar }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="font-semibold text-base">{item.username}</Text>
          <Text className="text-muted-foreground text-xs">{item.time}</Text>
        </View>
        {item.username === 'You' && (
          <View className="bg-primary/10 px-2 py-1 rounded-full">
            <Text className="text-primary text-xs font-medium">You</Text>
          </View>
        )}
      </View>

      <Text className="mb-4">{item.content}</Text>

      <View className="flex-row justify-between pt-3 border-t border-border/50">
        <TouchableOpacity
          onPress={() => handleLike(item.id)}
          className="flex-row items-center"
        >
          <ThumbsUp
            size={18}
            color={item.isLiked ? '#3b82f6' : colorScheme === 'dark' ? '#94a3b8' : '#64748b'}
            fill={item.isLiked ? '#3b82f6' : 'transparent'}
          />
          <Text className={`ml-2 ${item.isLiked ? 'text-blue-500' : 'text-muted-foreground'}`}>
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center">
          <MessageSquare size={18} color={colorScheme === 'dark' ? '#94a3b8' : '#64748b'} />
          <Text className="ml-2 text-muted-foreground">{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center">
          <Share2 size={18} color={colorScheme === 'dark' ? '#94a3b8' : '#64748b'} />
          <Text className="ml-2 text-muted-foreground">Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Create New Post Section */}
      <View className="p-4 border-b border-border bg-card/50">
        <View className="flex-row items-center">
          <Image
            source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You' }}
            className="w-12 h-12 rounded-full mr-3"
          />
          <View className="flex-1">
            <Input
              placeholder="What's on your mind?"
              value={newPost}
              onChangeText={setNewPost}
              multiline
              className="min-h-[40px]"
            />
          </View>
          <Button
            onPress={handleAddPost}
            size="sm"
            className="ml-2"
            disabled={newPost.trim().length === 0}
          >
            <Plus size={20} />
          </Button>
        </View>
      </View>

      {/* Posts Feed */}
      {posts.length > 0 ? (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-8">
          <Users size={64} className="text-muted-foreground mb-4" />
          <Text className="text-xl font-semibold mb-2">No posts yet</Text>
          <Text className="text-center text-muted-foreground">
            Be the first to share your rephrase experience!
          </Text>
        </View>
      )}
    </View>
  );
}