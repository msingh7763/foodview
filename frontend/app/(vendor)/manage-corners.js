import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import SmartImage from '../../components/SmartImage';
import * as ImagePicker from 'expo-image-picker';

export default function ManageCorners() {
  const { token, apiUrl } = useAuth();
  const router = useRouter();

  const [corners, setCorners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyCorners();
  }, []);

  async function fetchMyCorners() {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/foodcorners/my-corners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setCorners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImage(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
    }
  };

  async function handleSaveCorner() {
    if (!name || !location || !description) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Edit existing
        const res = await fetch(`${apiUrl}/foodcorners/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name, location, description, image })
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        // Add new
        const res = await fetch(`${apiUrl}/foodcorners`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name, location, description, image })
        });
        if (!res.ok) throw new Error('Creation failed');
      }

      setName('');
      setLocation('');
      setDescription('');
      setImage('');
      setEditingId(null);
      await fetchMyCorners();
      Alert.alert('Success', 'Food Corner registered successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Error processing request');
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditPress(corner) {
    setEditingId(corner._id);
    setName(corner.name);
    setLocation(corner.location);
    setDescription(corner.description);
    setImage(corner.image);
  }

  async function handleDeleteCorner(id) {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this food corner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${apiUrl}/foodcorners/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!res.ok) throw new Error('Delete failed');
              await fetchMyCorners();
            } catch (error) {
              Alert.alert('Error', 'Unable to delete food corner');
            }
          }
        }
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Food Corners</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Creation/Edit Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {editingId ? 'Edit Food Corner Details' : 'Add New Food Corner'}
          </Text>

          <Text style={styles.label}>Corner Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Downtown Grill"
            placeholderTextColor="#5C5B7A"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Location / Street Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5th Avenue, NY"
            placeholderTextColor="#5C5B7A"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Tell customers about the ambiance and specialties"
            placeholderTextColor="#5C5B7A"
            value={description}
            onChangeText={setDescription}
            multiline
          />


          <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage}>
            <Text style={styles.pickImageBtnText}>
              Pick Image from Gallery
            </Text>
          </TouchableOpacity>

          {image.trim() ? (
            <View style={styles.imagePreviewCard}>
              <SmartImage uri={image} style={styles.imagePreview} />
            </View>
          ) : null}

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveCorner} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {editingId ? 'Save Changes' : 'Create Corner'}
                </Text>
              )}
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setEditingId(null);
                  setName('');
                  setLocation('');
                  setDescription('');
                  setImage('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.sectionHeader}>My Active Food Corners</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#FF3E6C" />
        ) : corners.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>You haven't added any corners yet.</Text>
          </View>
        ) : (
          corners.map(corner => (
            <View key={corner._id} style={styles.cornerCard}>
              <SmartImage uri={corner.image} style={styles.cornerImage} />
              <View style={styles.cornerDetails}>
                <Text style={styles.cornerName}>{corner.name}</Text>
                <Text style={styles.cornerLocation}>{corner.location}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditPress(corner)}>
                    <Feather name="edit-2" size={16} color="#8A89A6" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteCorner(corner._id)}>
                    <Feather name="trash-2" size={16} color="#FF3E6C" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0C1D',
    paddingTop: 50
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#161530',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#24234C'
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  formContainer: {
    backgroundColor: '#161530',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#24234C',
    marginBottom: 24
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16
  },
  label: {
    color: '#C5C5D8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    backgroundColor: '#0D0C1D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#24234C',
    color: '#FFFFFF',
    height: 44,
    paddingHorizontal: 12,
    fontSize: 15
  },
  imagePreviewCard: {
    marginTop: 12,
    backgroundColor: '#0D0C1D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#24234C',
    overflow: 'hidden'
  },
  imagePreviewLabel: {
    color: '#8A89A6',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8
  },
  imagePreview: {
    width: '100%',
    height: 180
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 20
  },
  pickImageBtn: {
    backgroundColor: '#24234C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#393863',
  },
  pickImageBtnText: {
    color: '#E0E0E0',
    fontSize: 14,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#FF3E6C',
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
    marginRight: 8
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14
  },
  cancelBtn: {
    backgroundColor: '#0D0C1D',
    borderWidth: 1,
    borderColor: '#24234C',
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  cancelBtnText: {
    color: '#8A89A6',
    fontWeight: 'bold',
    fontSize: 14
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  emptyCard: {
    backgroundColor: '#161530',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center'
  },
  emptyText: {
    color: '#8A89A6',
    fontSize: 14
  },
  cornerCard: {
    flexDirection: 'row',
    backgroundColor: '#161530',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#24234C',
    overflow: 'hidden',
    height: 100
  },
  cornerImage: {
    width: 90,
    height: 100,
    alignSelf: 'stretch'
  },
  cornerDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between'
  },
  cornerName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold'
  },
  cornerLocation: {
    color: '#8A89A6',
    fontSize: 12
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  actionBtn: {
    marginLeft: 16
  }
});
