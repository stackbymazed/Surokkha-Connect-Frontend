import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Image, View } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
}

export const SocialButton = ({ title, onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  text: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
});
