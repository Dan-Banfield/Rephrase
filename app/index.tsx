import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Tabs } from 'expo-router';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
  Image,
  Linking,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Contacts from 'expo-contacts';
import * as SMS from 'expo-sms'; // <--- IMPORT SMS
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings, X } from 'lucide-react-native';
import { generateMessage } from '@/services/ai'; // <--- IMPORT YOUR BACKEND

const SCREEN_OPTIONS = {
  title: 'Rephrase',
  headerTransparent: false,
};

const DEMOGRAPHIC_OPTIONS = [
  { label: 'Gen-Z (15-20)', color: 'bg-blue-100 text-blue-800' },
  { label: 'Millenial (30-40)', color: 'bg-green-100 text-green-800' },
  { label: 'Polite (60+)', color: 'bg-pink-100 text-pink-800' },
  { label: 'Professional', color: 'bg-gray-100 text-gray-800' }, // Added for default
];

const STORAGE_KEY = 'contact_demographics_v1';

type ContactItem = {
  id: string;
  name: string;
  avatar?: string;
  demographic: string; 
  role?: string; 
  phoneNumbers?: Contacts.PhoneNumber[]; // <--- Need phone numbers
};

const DemographicBadge = ({ type }: { type: string }) => {
  const option = DEMOGRAPHIC_OPTIONS.find(o => o.label === type);
  const colorClass = option ? option.color : 'bg-slate-100 text-slate-500';
  return (
    <View className={`px-2 py-0.5 rounded-full ${colorClass.split(' ')[0]}`}>
      <Text className={`text-[10px] font-medium ${colorClass.split(' ')[1]}`}>
        {type}
      </Text>
    </View>
  );
};

export default function Screen() {
  const { colorScheme } = useColorScheme();
  
  const [permissionStatus, setPermissionStatus] = React.useState<string | null>(null);
  const [contacts, setContacts] = React.useState<ContactItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false); // New loading state for AI
  
  const [message, setMessage] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selectedContactIds, setSelectedContactIds] = React.useState<Set<string>>(new Set());
  const [editingContactId, setEditingContactId] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Contacts.getPermissionsAsync();
      setPermissionStatus(status);
      if (status === 'granted') loadContacts();
    })();
  }, []);

  const requestPermission = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    setPermissionStatus(status);
    if (status === 'granted') loadContacts();
    else if (status === 'denied') Linking.openSettings();
  };

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      // Requested PhoneNumbers field as well
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
        sort: Contacts.SortTypes.FirstName
      });

      const savedDataJson = await AsyncStorage.getItem(STORAGE_KEY);
      const savedDemographics = savedDataJson ? JSON.parse(savedDataJson) : {};

      if (data.length > 0) {
        const formattedContacts: ContactItem[] = data.map(c => ({
          id: c.id ?? Math.random().toString(),
          name: c.name || 'Unknown Contact',
          avatar: c.image?.uri,
          demographic: savedDemographics[c.id] || 'Professional', // Default to Professional
          role: 'Phone Contact',
          phoneNumbers: c.phoneNumbers
        })).filter(c => c.name !== 'Unknown Contact' && c.phoneNumbers && c.phoneNumbers.length > 0);
        
        setContacts(formattedContacts);
      }
    } catch (e) {
      console.error("Failed to load contacts", e);
    }
    setIsLoading(false);
  };

  const updateDemographic = async (newDemographic: string) => {
    if (!editingContactId) return;

    const updatedContacts = contacts.map(c => 
      c.id === editingContactId ? { ...c, demographic: newDemographic } : c
    );
    setContacts(updatedContacts);
    
    try {
      const mapToSave = updatedContacts.reduce((acc, curr) => {
        if (curr.demographic !== 'Unknown') {
          acc[curr.id] = curr.demographic;
        }
        return acc;
      }, {} as Record<string, string>);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapToSave));
    } catch (e) {
      console.error("Failed to save demographic", e);
    }

    setEditingContactId(null); 
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    const next = new Set(selectedContactIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedContactIds(next);
  };

  // --- CORE LOGIC: SENDING ---

  const handleSend = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Error", "SMS is not available on this device");
      return;
    }

    setIsGenerating(true);

    // 1. Filter selected contacts
    const targets = contacts.filter(c => selectedContactIds.has(c.id));

    // 2. Group by Demographic
    // Structure: { 'Gen-Z': [Contact1, Contact2], 'Polite': [Contact3] }
    const groups: Record<string, ContactItem[]> = {};
    targets.forEach(t => {
      if (!groups[t.demographic]) groups[t.demographic] = [];
      groups[t.demographic].push(t);
    });

    try {
      // 3. Generate messages for each group via Backend
      // We map the groups to promises to fetch them in parallel
      const groupKeys = Object.keys(groups);
      
      for (const demographic of groupKeys) {
        const recipients = groups[demographic];
        
        // Call our "Backend"
        const aiMessage = await generateMessage(message, demographic);

        // Get phone numbers
        const phoneNumbers = recipients
            .map(c => c.phoneNumbers?.[0]?.number)
            .filter(Boolean) as string[];

        if (phoneNumbers.length === 0) continue;

        // 4. Send SMS
        // Note: We await the result. The user has to return to the app 
        // to trigger the next loop if there are multiple demographics.
        await SMS.sendSMSAsync(phoneNumbers, aiMessage);
      }

    } catch (error) {
      Alert.alert("Error", "Failed to generate or send messages.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
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
              value={message}
              onChangeText={setMessage}
              className="min-h-[100px]"
             />
          </View>

          <View className="flex-1 gap-3">
            <View className="flex-row justify-between items-end">
              <Text variant="h3" className="font-semibold">Select Recipients</Text>
              {permissionStatus === 'granted' && (
                <Text className="text-muted-foreground text-xs">
                    {selectedContactIds.size} selected
                </Text>
              )}
            </View>

            {permissionStatus !== 'granted' ? (
                <View className="flex-1 items-center justify-center p-6 bg-secondary/10 rounded-xl border-2 border-dashed border-muted-foreground/20">
                    <Text className="mb-4 text-center text-muted-foreground">Please allow contact access.</Text>
                    <Button onPress={requestPermission} variant="secondary"><Text>Allow Access</Text></Button>
                </View>
            ) : (
                <>
                    <Input 
                        placeholder="Search contacts..." 
                        value={search}
                        onChangeText={setSearch}
                    />
                    {isLoading ? (
                        <ActivityIndicator size="large" className="mt-10" />
                    ) : (
                        <FlatList
                        data={filteredContacts}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
                        renderItem={({ item }) => {
                            const isSelected = selectedContactIds.has(item.id);
                            return (
                            <View className={`flex-row items-center p-2 rounded-lg border ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                                <Pressable onPress={() => toggleSelection(item.id)} className="flex-1 flex-row items-center">
                                    <View className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                    {isSelected && <View className="w-2 h-2 bg-white rounded-full" />}
                                    </View>
                                    {item.avatar ? (
                                        <Image source={{ uri: item.avatar }} className="w-10 h-10 rounded-full mr-3 bg-gray-200" />
                                    ) : (
                                        <View className="w-10 h-10 rounded-full mr-3 bg-gray-200 items-center justify-center">
                                            <Text className="text-gray-500 font-bold">{item.name.charAt(0)}</Text>
                                        </View>
                                    )}
                                    <View className="flex-1">
                                        <Text className="font-medium text-base" numberOfLines={1}>{item.name}</Text>
                                        <View className="flex-row mt-1">
                                            <DemographicBadge type={item.demographic} />
                                        </View>
                                    </View>
                                </Pressable>
                                <TouchableOpacity onPress={() => setEditingContactId(item.id)} className="p-2 ml-2 bg-secondary/20 rounded-full">
                                    <Settings size={20} className="text-muted-foreground" color="gray" />
                                </TouchableOpacity>
                            </View>
                            );
                        }}
                        />
                    )}
                </>
            )}
          </View>

          <View className="pt-2">
             <Button 
                size="lg" 
                onPress={handleSend} 
                disabled={selectedContactIds.size === 0 || message.length === 0 || isGenerating}
             >
                {isGenerating ? (
                   <View className="flex-row items-center justify-center gap-2">
                      <ActivityIndicator color="white" />
                      <Text className="text-white">Rephrasing...</Text>
                   </View>
                ) : (
                   <Text>
                     {selectedContactIds.size > 0 ? `Generate & Send (${selectedContactIds.size})` : 'Select a Contact'}
                   </Text>
                )}
             </Button>
          </View>

          <Modal animationType="fade" transparent={true} visible={!!editingContactId} onRequestClose={() => setEditingContactId(null)}>
            <View className="flex-1 justify-center items-center bg-black/50 p-4">
                <View className="bg-background w-full max-w-sm rounded-2xl p-6 shadow-xl border border-border">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text variant="h3">Assign Demographic</Text>
                        <Pressable onPress={() => setEditingContactId(null)}>
                            <X size={24} className="text-foreground" color="gray" />
                        </Pressable>
                    </View>
                    <Text className="text-muted-foreground mb-4">How should the message sound for this contact?</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {DEMOGRAPHIC_OPTIONS.map((option) => (
                            <Pressable
                                key={option.label}
                                onPress={() => updateDemographic(option.label)}
                                className={`px-4 py-3 rounded-xl border border-border bg-card flex-grow items-center ${
                                    contacts.find(c => c.id === editingContactId)?.demographic === option.label ? 'border-primary bg-primary/10' : ''
                                }`}
                            >
                                <Text className="font-medium">{option.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </View>
          </Modal>

        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}