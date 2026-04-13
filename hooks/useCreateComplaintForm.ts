import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { createComplaint } from '@/services/reportService';

export type LocalImageFile = {
  uri: string;
  type: string;
  name: string;
};

type HandleSubmitParams = {
  type: 'report' | 'suggestion';
  id_building?: number;
  classroom?: string;
  onSuccess?: (id: number) => void;
};

export function useCreateComplaintForm() {
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('MAINTENANCE');
  const [images, setImages] = useState<LocalImageFile[]>([]);
  const [loading, setLoading] = useState(false);

  const isSubmitDisabled = useMemo(() => {
    return title.trim().length === 0 || description.trim().length === 0;
  }, [title, description]);

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Límite alcanzado', 'Máximo 3 imágenes');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso requerido',
        'Necesitas permitir acceso a tus fotos.',
      );
      return;
    }

    const remainingSlots = 3 - images.length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
    });

    if (result.canceled) return;

    const newImages: LocalImageFile[] = result.assets.map((asset, index) => ({
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || `photo_${Date.now()}_${index}.jpg`,
    }));

    setImages((prev) => {
      const merged = [...prev, ...newImages];
      return merged.slice(0, 3);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('MAINTENANCE');
    setImages([]);
  };

  const getErrorMessage = (error: any): string => {
    if (typeof error?.detail === 'string') return error.detail;

    if (Array.isArray(error?.detail)) {
      return error.detail
        .map((e: any) => e?.msg || e?.message || JSON.stringify(e))
        .join('\n');
    }

    if (typeof error?.message === 'string') return error.message;

    return 'Ocurrió un error';
  };

  const handleSubmit = async ({
    type,
    id_building,
    classroom,
    onSuccess,
  }: HandleSubmitParams) => {
    if (isSubmitDisabled) return;

    try {
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      setLoading(true);

      const response = await createComplaint({
        title,
        description,
        category,
        token,
        type: type === 'report' ? 'REPORT' : 'SUGGESTION',
        id_building: type === 'report' ? id_building : undefined,
        classroom: type === 'report' ? classroom : undefined,
        images: type === 'report' ? images : undefined,
      });

      resetForm();
      onSuccess?.((response as { id: number }).id);
    } catch (error: any) {
      console.log('ERROR:', JSON.stringify(error, null, 2));
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    images,
    loading,
    isSubmitDisabled,
    pickImage,
    removeImage,
    handleSubmit,
    resetForm,
  };
}
