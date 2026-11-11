import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '../constants/colors';
import {
  FORM_FIELD_TYPES,
  MAX_FORM_FIELDS,
  isValidFormConfig,
} from '../utils/forms';
import common from '../styles/common';

export default function GenerateScreen({ onBack }) {
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState([{ type: 'text', label: '' }]);
  const [qrValue, setQrValue] = useState(null);

  const updateField = (index, patch) => {
    setFields((currentFields) =>
      currentFields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...patch } : field,
      ),
    );
    setQrValue(null);
  };

  const addField = () => {
    setFields((currentFields) => [...currentFields, { type: 'text', label: '' }]);
    setQrValue(null);
  };

  const removeField = (index) => {
    setFields((currentFields) =>
      currentFields.filter((_, fieldIndex) => fieldIndex !== index),
    );
    setQrValue(null);
  };

  const generate = () => {
    const form = {
      title: title.trim(),
      fields: fields.map((field) => ({
        type: field.type,
        label: field.label.trim(),
      })),
    };

    if (form.title.length > 100) {
      Alert.alert('Judul terlalu panjang', 'Gunakan maksimal 100 karakter.');
      return;
    }
    if (!isValidFormConfig(form)) {
      Alert.alert(
        'Form belum lengkap',
        'Isi judul dan 1–10 field dengan label unik (maksimal 40 karakter).',
      );
      return;
    }

    const value = JSON.stringify(form);
    if (value.length > 2000) {
      Alert.alert('Form terlalu besar', 'Kurangi jumlah atau panjang field.');
      return;
    }
    setQrValue(value);
  };

  return (
    <ScrollView
      contentContainerStyle={common.content}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity onPress={onBack} hitSlop={12} style={common.formBackIcon}>
        <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
      </TouchableOpacity>
      <Text style={[common.title, common.formTitle]}>Buat QR Form</Text>

      <View style={common.searchBox}>
        <TextInput
          style={[common.searchInput, common.formInput]}
          placeholder="Judul form"
          placeholderTextColor={COLORS.muted}
          value={title}
          maxLength={100}
          onChangeText={(value) => {
            setTitle(value);
            setQrValue(null);
          }}
        />
      </View>

      {fields.map((field, index) => (
        <View key={index} style={common.formField}>
          <View style={[common.searchBox, styles.formFieldLabelBox]}>
            <TextInput
              style={[common.searchInput, common.formInput]}
              placeholder={`Label field ${index + 1}`}
              placeholderTextColor={COLORS.muted}
              value={field.label}
              maxLength={40}
              onChangeText={(value) => updateField(index, { label: value })}
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Hapus field ${index + 1}`}
              onPress={() => removeField(index)}
              disabled={fields.length === 1}
              hitSlop={12}
            >
              <Ionicons
                name="close-circle-outline"
                size={22}
                color={fields.length === 1 ? COLORS.muted : COLORS.secondary}
              />
            </TouchableOpacity>
          </View>
          <View style={common.filterRow}>
            {FORM_FIELD_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => updateField(index, { type })}
                style={[
                  common.filterChip,
                  field.type === type && common.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    common.filterText,
                    field.type === type && common.filterTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[common.logoutButton, styles.addFieldButton]}
        onPress={addField}
        disabled={fields.length >= MAX_FORM_FIELDS}
      >
        <Ionicons name="add" size={20} color={COLORS.secondary} />
        <Text style={common.logoutText}>Tambah field</Text>
      </TouchableOpacity>

      <TouchableOpacity style={common.quizButton} onPress={generate}>
        <Text style={common.quizButtonText}>Generate QR</Text>
      </TouchableOpacity>

      {qrValue ? (
        <View style={styles.generatedQr}>
          <QRCode value={qrValue} size={220} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formFieldLabelBox: { marginBottom: 8 },
  addFieldButton: { marginBottom: 12 },
  generatedQr: {
    alignItems: 'center',
    padding: 24,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
});
