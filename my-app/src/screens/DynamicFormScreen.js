import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { isValidFormConfig } from '../utils/forms';
import common from '../styles/common';

export default function DynamicFormScreen({ config, onBack }) {
  const [values, setValues] = useState({});

  const setValue = (label, value) =>
    setValues((currentValues) => ({ ...currentValues, [label]: value }));

  if (!isValidFormConfig(config)) {
    return (
      <View style={common.emptyBox}>
        <Text style={common.emptyDesc}>Data form tidak valid.</Text>
        <TouchableOpacity onPress={onBack} style={styles.formBackButton}>
          <Text style={common.quizButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={common.content}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity onPress={onBack} hitSlop={12} style={common.formBackIcon}>
        <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
      </TouchableOpacity>
      <Text style={[common.title, common.formTitle]}>{config.title}</Text>

      {config.fields.map((field) => (
        <View key={field.label} style={common.formField}>
          <Text style={common.greeting}>{field.label}</Text>
          {field.type === 'switch' ? (
            <Switch
              value={Boolean(values[field.label])}
              onValueChange={(value) => setValue(field.label, value)}
              trackColor={{
                false: COLORS.addCreamDark,
                true: COLORS.primaryMid,
              }}
            />
          ) : (
            <View style={[common.searchBox, common.formInputBox]}>
              <TextInput
                style={[common.searchInput, common.formInput]}
                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                placeholder={field.label}
                placeholderTextColor={COLORS.muted}
                value={values[field.label] ?? ''}
                onChangeText={(value) => setValue(field.label, value)}
              />
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity
        style={common.quizButton}
        onPress={() =>
          Alert.alert(
            'Jawaban Form',
            JSON.stringify(values, null, 2) || 'Tidak ada jawaban.',
          )
        }
      >
        <Text style={common.quizButtonText}>Kirim</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formBackButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
});
