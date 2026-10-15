import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PostIndex from '../screens/posts/Index';
import PostCreate from '../screens/posts/Create';
import PostEdit from '../screens/posts/Edit';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PostIndex">
        <Stack.Screen
          name="PostIndex"
          component={PostIndex}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PostCreate"
          component={PostCreate}
          options={{ title: 'Create Post' }}
        />
        <Stack.Screen
          name="PostEdit"
          component={PostEdit}
          options={{ title: 'Edit Post' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}