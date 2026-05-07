import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

export const CustomInput = ({ placeholder, value, onChangeText, secureTextEntry }: Props) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
  },
});
