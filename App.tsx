// In App.js in a new project

// import 'react-native-gesture-handler';
import * as React from 'react';

import {View, Text} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootTabs from './src/route/route';

export default function App() {
  return (
    <NavigationContainer>
      <RootTabs />
    </NavigationContainer>
  );
}
