import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// 导入屏幕组件（先创建占位组件）
import BookShelfScreen from '@screens/BookShelf/BookShelfScreen';
import ReaderScreen from '@screens/Reader/ReaderScreen';
import SettingsScreen from '@screens/Settings/SettingsScreen';
import ImportScreen from '@screens/Import/ImportScreen';

import {RootStackParamList} from '@types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// 主标签导航
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}>
      <Tab.Screen
        name="书架"
        component={BookShelfScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            // 这里后续会用真实的图标
            <></>
          ),
        }}
      />
      <Tab.Screen
        name="设置"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            // 这里后续会用真实的图标
            <></>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// 根导航器
function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="BookShelf"
        component={MainTabNavigator}
      />
      <Stack.Screen
        name="Reader"
        component={ReaderScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Import"
        component={ImportScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;