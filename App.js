import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity, Image } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import TransactionScreen from './screens/BookTransactionScreen';
import Searchscreen from './screens/SearchScreen';

export default class App extends React.Component {
  render(){
    return (
      
        <AppContainer />
      
    );
  }   
}

const TabNavigator = createBottomTabNavigator({
  Transaction: {screen: TransactionScreen},
  Search: {screen: Searchscreen},
},
{

defaultNavigationOptions : ({navigation}) => ({
  tabBarIcon : () => {
    const routeName = navigation.state.routeName
    if(routeName === "Transaction"){
      return(
        <Image source = {require("./Images/book.png")} 
        style = {{width : 40, height : 40}}
        />
      )
    }
    else if(routeName === "Search") {
      return(
        <Image source = {require("./Images/searchingbook.png")}
        style = {{width : 40, height : 40}}
        />
      )
    }
  }
})
}
);

const AppContainer =  createAppContainer(TabNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
