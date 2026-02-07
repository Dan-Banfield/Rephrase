import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';

import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_CONTACTS = [
  { id: '1', name: 'Sarah Miller', avatar: 'https://i.pravatar.cc/150?u=1', demographic: 'Professional', role: 'Boss' },
  { id: '2', name: 'Mike Ross', avatar: 'https://i.pravatar.cc/150?u=2', demographic: 'Casual', role: 'Best Friend' },
  { id: '3', name: 'Grandma', avatar: 'https://i.pravatar.cc/150?u=3', demographic: 'Polite/Simple', role: 'Family' },
  { id: '4', name: 'Client X', avatar: 'https://i.pravatar.cc/150?u=4', demographic: 'Formal', role: 'Client' },
  { id: '5', name: 'Team Alpha', avatar: 'https://i.pravatar.cc/150?u=5', demographic: 'Technical', role: 'Colleagues' },
];

const SCREEN_OPTIONS = {
  title: 'Rephrase',
  headerTransparent: false,
};

const DemographicBadge = ({ type }: { type: string }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  
  if (type === 'Professional') colorClass = 'bg-blue-100 text-blue-800';
  if (type === 'Casual') colorClass = 'bg-green-100 text-green-800';
  if (type === 'Formal') colorClass = 'bg-purple-100 text-purple-800';

  return (
    <View className={`px-2 py-0.5 rounded-full ${colorClass.split(' ')[0]}`}>
      <Text className={`text-xs font-medium ${colorClass.split(' ')[1]}`}>
        {type}
      </Text>
    </View>
  );
};

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const [message, setMessage] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selectedContactIds, setSelectedContactIds] = React.useState<Set<string>>(new Set());

  const filteredContacts = MOCK_CONTACTS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    const next = new Set(selectedContactIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedContactIds(next);
  };

  const handleSend = () => {
    console.log("Rephrasing for:", Array.from(selectedContactIds));
    console.log("Message:", message);
  };

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={100}
      >
        <SafeAreaView className="flex-1 bg-background p-4 gap-6">
          
          <View className="gap-2">
            <Text variant="h3" className="font-semibold">Original Message</Text>
            <Textarea 
              placeholder="Type the rough draft of your message here..."
              value={message}
              onChangeText={setMessage}
              className="min-h-[100px]"
            />
          </View>

          <View className="flex-1 gap-3">
            <View className="flex-row justify-between items-end">
              <Text variant="h3" className="font-semibold">Select Recipients</Text>
              <Text className="text-muted-foreground text-xs">
                {selectedContactIds.size} selected
              </Text>
            </View>

            <Input 
              placeholder="Search contacts..." 
              value={search}
              onChangeText={setSearch}
            />

            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
              renderItem={({ item }) => {
                const isSelected = selectedContactIds.has(item.id);
                
                return (
                  <Pressable 
                    onPress={() => toggleSelection(item.id)}
                    className={`flex-row items-center p-3 rounded-lg border ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-card'
                    }`}
                  >
                    <View className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${
                      isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                    }`}>
                      {isSelected && <View className="w-2 h-2 bg-white rounded-full" />}
                    </View>

                    <Image 
                      source={{ uri: item.avatar }} 
                      className="w-10 h-10 rounded-full mr-3 bg-gray-200"
                    />

                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-medium text-base">{item.name}</Text>
                        <DemographicBadge type={item.demographic} />
                      </View>
                      <Text className="text-sm text-muted-foreground">{item.role}</Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>

          <View className="pt-2">
             <Button 
                size="lg" 
                onPress={handleSend}
                disabled={selectedContactIds.size === 0 || message.length === 0}
             >
                <Text>
                  {selectedContactIds.size > 0 
                    ? `Rephrase for ${selectedContactIds.size} Person${selectedContactIds.size > 1 ? 's' : ''}` 
                    : 'Select a Contact'}
                </Text>
             </Button>
          </View>

        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}