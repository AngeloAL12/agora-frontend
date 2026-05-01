import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/constants/theme';
import type { ComplaintStatus } from '@/services/complaintService';
import {
  complaintStatusOptions,
  getComplaintStatusMeta,
} from '@/utils/complaints';

type StatusMenuProps = {
  visible: boolean;
  selectedStatus: ComplaintStatus;
  onDismiss: () => void;
  onSelect: (status: ComplaintStatus) => void;
};

export function StatusMenu({
  visible,
  selectedStatus,
  onDismiss,
  onSelect,
}: StatusMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.modalOverlay} onPress={onDismiss}>
        <View style={styles.statusMenu}>
          {complaintStatusOptions.map((option) => {
            const meta = getComplaintStatusMeta(option.value);
            const selected = selectedStatus === option.value;

            return (
              <Pressable
                key={option.value}
                style={[styles.statusOption, selected && styles.statusSelected]}
                onPress={() => onSelect(option.value)}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: meta.bg }]}
                />
                <Text style={styles.statusOptionText}>{option.label}</Text>
                {selected ? (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.bluePrimary}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 86,
    paddingRight: 20,
  },
  statusMenu: {
    width: 220,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingVertical: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  statusOption: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusSelected: {
    backgroundColor: colors.bluePrimaryLight2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interSemiBold,
  },
});
