import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../context';
import { Feather, Ionicons } from '@expo/vector-icons';
import SmartImage from '../../../components/SmartImage';


export default function FoodCornerDetail() {
  const { id } = useLocalSearchParams();
  const { token, apiUrl } = useAuth();
  const router = useRouter();

  const [corner, setCorner] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCornerDetails();
  }, [id]);

  async function fetchCornerDetails() {
    try {
      setLoading(true);
      // Fetch details from list (or single endpoint)
      const resCorners = await fetch(`${apiUrl}/foodcorners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cornersData = await resCorners.json();
      const currentCorner = cornersData.find(c => c._id === id);
      setCorner(currentCorner);

      // Fetch meals for this corner
      const resMeals = await fetch(`${apiUrl}/meals?foodCornerId=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const mealsData = await resMeals.json();
      if (Array.isArray(mealsData)) setMeals(mealsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3E6C" />
      </View>
    );
  }

  if (!corner) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Food Corner not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Banner / Cover Image */}
      <SmartImage uri={corner.image} style={styles.bannerImage} />

      {/* Floating Back Action */}
      <TouchableOpacity style={styles.headerBackBtn} onPress={() => router.back()}>
        <Feather name="chevron-left" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.detailsContainer}>
          <Text style={styles.name}>{corner.name}</Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#FF3E6C" />
            <Text style={styles.location}>{corner.location}</Text>
          </View>

          <Text style={styles.description}>{corner.description}</Text>

          <View style={styles.divider} />

          {/* Menu Items List */}
          <Text style={styles.menuTitle}>Menu List</Text>
          {meals.length === 0 ? (
            <View style={styles.emptyMenuCard}>
              <Text style={styles.emptyMenuText}>No meals listed for this food corner yet.</Text>
            </View>
          ) : (
            meals.map(meal => (
              <TouchableOpacity
                key={meal._id}
                style={styles.mealCard}
                onPress={() => router.push(`/(customer)/meal/${meal._id}`)}
              >
                <SmartImage uri={meal.image} style={styles.mealImage} />
                <View style={styles.mealDetails}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealDesc} numberOfLines={2}>{meal.description}</Text>
                  <View style={styles.mealMetaRow}>
                    <Text style={styles.mealPrice}>₹{meal.price.toFixed(2)}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#FFD700" style={{ marginRight: 4 }} />
                      <Text style={styles.ratingText}>{meal.averageRating || 'New'}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0C1D'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0C1D',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0D0C1D',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20
  },
  backBtn: {
    backgroundColor: '#FF3E6C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  bannerImage: {
    width: '100%',
    height: 250
  },
  headerBackBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13, 12, 29, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  contentScroll: {
    flex: 1,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#0D0C1D'
  },
  detailsContainer: {
    padding: 24
  },
  name: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold'
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  location: {
    color: '#8A89A6',
    fontSize: 14,
    marginLeft: 6
  },
  description: {
    color: '#C5C5D8',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 15
  },
  divider: {
    height: 1,
    backgroundColor: '#24234C',
    marginVertical: 24
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  emptyMenuCard: {
    backgroundColor: '#161530',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center'
  },
  emptyMenuText: {
    color: '#8A89A6',
    fontSize: 14
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#161530',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#24234C',
    overflow: 'hidden',
    height: 110
  },
  mealImage: {
    width: 100,
    height: 110,
    alignSelf: 'stretch'
  },
  mealDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between'
  },
  mealName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  mealDesc: {
    color: '#8A89A6',
    fontSize: 12
  },
  mealMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  mealPrice: {
    color: '#FF3E6C',
    fontSize: 16,
    fontWeight: 'bold'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 14
  }
});
