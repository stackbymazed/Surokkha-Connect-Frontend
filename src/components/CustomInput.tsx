import React, { useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Text } from 'react-native';

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

export const CustomInput = ({ placeholder, value, onChangeText, secureTextEntry }: Props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
      />
      {/* Password field হলে eye icon দেখাবে */}
      {secureTextEntry && (
        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Text style={styles.eyeIcon}>
            {isPasswordVisible ? '🙈' : '👁️'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    padding: 15,
    paddingRight: 50,
    borderRadius: 12,
    fontSize: 16,
  },
  eyeBtn: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
});
