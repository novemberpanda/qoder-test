import 'react-native-gesture-handler/jestSetup';

// Mock native modules
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  exists: jest.fn(() => Promise.resolve(true)),
  readFile: jest.fn(() => Promise.resolve('mock file content')),
  writeFile: jest.fn(() => Promise.resolve()),
  mkdir: jest.fn(() => Promise.resolve()),
  copyFile: jest.fn(() => Promise.resolve()),
  moveFile: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
  stat: jest.fn(() => Promise.resolve({size: 1024})),
  readDir: jest.fn(() => Promise.resolve([])),
  getFSInfo: jest.fn(() => Promise.resolve({freeSpace: 1024 * 1024})),
}));

jest.mock('react-native-sqlite-storage', () => ({
  DEBUG: jest.fn(),
  enablePromise: jest.fn(),
  openDatabase: jest.fn(() => ({
    executeSql: jest.fn(() => Promise.resolve([{rows: {length: 0, item: jest.fn()}}])),
    transaction: jest.fn(),
    close: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock('react-native-document-picker', () => ({
  pick: jest.fn(() => Promise.resolve([{
    uri: 'mock://file.epub',
    name: 'test.epub',
    type: 'application/epub+zip',
    size: 1024,
  }])),
  types: {
    allFiles: 'public.data',
  },
}));

jest.mock('react-native-webview', () => {
  const React = require('react');
  const {View} = require('react-native');
  
  return {
    WebView: React.forwardRef((props, ref) => React.createElement(View, props)),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {bookId: 1},
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({children}) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children,
  }),
}));

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};