import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import SmartImage from '../../components/SmartImage';

export default function ManageMeals() {
  const { token, apiUrl } = useAuth();
  const router = useRouter();

  const [corners, setCorners] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [foodCornerId, setFoodCornerId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCornerAndMeals();
  }, []);

  async function fetchCornerAndMeals() {
    try {
      setLoading(true);
      // Fetch vendor's food corners to select from
      const resCorners = await fetch(`${apiUrl}/foodcorners/my-corners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cornersData = await resCorners.json();
      if (Array.isArray(cornersData)) {
        setCorners(cornersData);
        if (cornersData.length > 0) setFoodCornerId(cornersData[0]._id);
      }

      // Fetch all meals
      const resMeals = await fetch(`${apiUrl}/meals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const mealsData = await resMeals.json();
      if (Array.isArray(mealsData)) {
        // Filter meals belonging to the vendor's corners
        const cornerIdsSet = new Set(cornersData.map(c => c._id));
        const filteredMeals = mealsData.filter(m => m.foodCornerId && (cornerIdsSet.has(m.foodCornerId._id) || cornerIdsSet.has(m.foodCornerId)));
        setMeals(filteredMeals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveMeal() {
    if (!foodCornerId || !name || !price || !description) {
      Alert.alert('Validation Error', 'Please select a Food Corner and fill out Name, Price and Description');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update Meal
        const res = await fetch(`${apiUrl}/meals/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name, price: priceNum, description, image })
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        // Create Meal
        const res = await fetch(`${apiUrl}/meals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ foodCornerId, name, price: priceNum, description, image })
        });
        if (!res.ok) throw new Error('Creation failed');
      }

      setName('');
      setPrice('');
      setDescription('');
      setImage('');
      setEditingId(null);
      await fetchCornerAndMeals();
      Alert.alert('Success', 'Meal details saved successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Error processing request');
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditPress(meal) {
    setEditingId(meal._id);
    setFoodCornerId(meal.foodCornerId._id || meal.foodCornerId);
    setName(meal.name);
    setPrice(meal.price.toString());
    setDescription(meal.description);
    setImage(meal.image);
  }

  async function handleDeleteMeal(id) {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${apiUrl}/meals/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!res.ok) throw new Error('Delete failed');
              await fetchCornerAndMeals();
            } catch (error) {
              Alert.alert('Error', 'Unable to delete meal');
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
        <Text style={styles.headerTitle}>Manage Menu Items</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {corners.length === 0 ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>You must register at least one Food Corner before adding meals.</Text>
            <TouchableOpacity style={styles.redirectBtn} onPress={() => router.push('/(vendor)/manage-corners')}>
              <Text style={styles.redirectBtnText}>Go to Food Corners</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editingId ? 'Edit Meal Details' : 'Add New Meal'}
            </Text>

            <Text style={styles.label}>Select Food Corner</Text>
            <View style={styles.pickerContainer}>
              {corners.map(c => (
                <TouchableOpacity
                  key={c._id}
                  style={[styles.pickerItem, foodCornerId === c._id && styles.pickerItemActive]}
                  onPress={() => setFoodCornerId(c._id)}
                  disabled={!!editingId} // Block corner changing on edit
                >
                  <Text style={[styles.pickerText, foodCornerId === c._id && styles.pickerTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Meal Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Cheese Burger"
              placeholderTextColor="#5C5B7A"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9.99"
              placeholderTextColor="#5C5B7A"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="List main ingredients, sizing, and details"
              placeholderTextColor="#5C5B7A"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Image URL (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/meal.jpg"
              placeholderTextColor="#5C5B7A"
              value={image}
              onChangeText={setImage}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSaveMeal} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {editingId ? 'Save Changes' : 'Add Meal'}
                  </Text>
                )}
              </TouchableOpacity>

              {editingId && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setEditingId(null);
                    setName('');
                    setPrice('');
                    setDescription('');
                    setImage('');
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <Text style={styles.sectionHeader}>Registered Meals</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#FF3E6C" />
        ) : meals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No meals listed yet.</Text>
          </View>
        ) : (
          meals.map(meal => (
            <View key={meal._id} style={styles.mealCard}>
              <SmartImage uri={meal.image} style={styles.mealImage} />
              <View style={styles.mealDetails}>
                <View>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealPrice}>${meal.price.toFixed(2)}</Text>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditPress(meal)}>
                    <Feather name="edit-2" size={16} color="#8A89A6" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteMeal(meal._id)}>
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
  warningCard: {
    backgroundColor: '#161530',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FF3E6C',
    alignItems: 'center',
    marginBottom: 24
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16
  },
  redirectBtn: {
    backgroundColor: '#FF3E6C',
    borderRadius: 8,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  redirectBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
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
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8
  },
  pickerItem: {
    backgroundColor: '#0D0C1D',
    borderWidth: 1,
    borderColor: '#24234C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8
  },
  pickerItemActive: {
    backgroundColor: '#FF3E6C',
    borderColor: '#FF3E6C'
  },
  pickerText: {
    color: '#8A89A6',
    fontSize: 13
  },
  pickerTextActive: {
    color: '#FFFFFF',
    fontWeight: '600'
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
  btnRow: {
    flexDirection: 'row',
    marginTop: 20
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
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#161530',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#24234C',
    overflow: 'hidden',
    height: 100
  },
  mealImage: {
    width: 90,
    height: 100,
    alignSelf: 'stretch'
  },
  mealDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between'
  },
  mealName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold'
  },
  mealPrice: {
    color: '#FF3E6C',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 4
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  actionBtn: {
    marginLeft: 16
  }
});
