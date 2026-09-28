import React from 'react';
import {View,StyleSheet} from 'react-native';
export default function Card({children,style}) {
  return <View style={[styles.card,style]}>{children}</View>;
}
const styles=StyleSheet.create({
  card:{backgroundColor:'#fff',borderRadius:17,padding:18,marginBottom:12,borderWidth:1,borderColor:'#edf0f6',shadowColor:'#132449',shadowOpacity:.04,shadowRadius:7,shadowOffset:{width:0,height:2},elevation:2}
});
