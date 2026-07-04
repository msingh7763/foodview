import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SmartImage from '../../components/SmartImage';

export default function CustomerHome() {
  const { token, apiUrl, logout } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [foodCorners, setFoodCorners] = useState([]);
  const [popularMeals, setPopularMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  async function fetchHomeData() {
    try {
      setLoading(true);
      // Fetch Food Corners
      const resCorners = await fetch(`${apiUrl}/foodcorners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cornersData = await resCorners.json();

      // Fetch Meals for popular list
      const resMeals = await fetch(`${apiUrl}/meals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const mealsData = await resMeals.json();

      if (Array.isArray(cornersData)) {
        setFoodCorners(cornersData.filter(fc => fc.name.toLowerCase() !== 'gordon grill house'));
      }
      if (Array.isArray(mealsData)) setPopularMeals(mealsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredCorners = foodCorners.filter(fc =>
    fc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fc.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topRatedCorners = [...foodCorners]
    .slice(0, 3); // Mocking top rating calculation or displaying curated

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Foodie!</Text>
          <Text style={styles.subtitle}>Find the best taste today</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/(customer)/profile')} style={styles.profileBtn}>
            <Ionicons name="person-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#FF3E6C" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#8A89A6" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food corners, areas..."
            placeholderTextColor="#5C5B7A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF3E6C" style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Top Rated Food Corners Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Food Corners</Text>
            </View>

            {topRatedCorners.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No food corners registered yet.</Text>
              </View>
            ) : (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={topRatedCorners}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.featuredCard}
                    onPress={() => router.push(`/(customer)/corner/${item._id}`)}
                  >
                    <SmartImage uri={item.image} style={styles.featuredImage} />
                    <View style={styles.featuredInfo}>
                      <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={12} color="#8A89A6" />
                        <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}

            {/* All Food Corners */}
            <Text style={styles.sectionTitle}>Browse Food Corners</Text>
            {filteredCorners.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No matching food corners found.</Text>
              </View>
            ) : (
              filteredCorners.map(item => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.cornerCard}
                  onPress={() => router.push(`/(customer)/corner/${item._id}`)}
                >
                  <SmartImage uri={item.image} style={styles.cornerImage} />
                  <View style={styles.cornerDetails}>
                    <Text style={styles.cornerName}>{item.name}</Text>
                    <Text style={styles.cornerDesc} numberOfLines={2}>{item.description}</Text>
                    <View style={styles.cornerMeta}>
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={14} color="#8A89A6" style={{ marginRight: 4 }} />
                        <Text style={styles.locationText}>{item.location}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {/* Popular Dishes */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Popular Dishes</Text>
            {popularMeals.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No meals listed yet.</Text>
              </View>
            ) : (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={popularMeals}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dishCard}
                    onPress={() => router.push(`/(customer)/meal/${item._id}`)}
                  >
                    <SmartImage uri={item.image} style={styles.dishImage} />
                    <View style={styles.dishInfo}>
                      <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
                      <View style={styles.dishPriceRow}>
                        <Text style={styles.dishPrice}>${item.price.toFixed(2)}</Text>
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={10} color="#FFD700" style={{ marginRight: 2 }} />
                          <Text style={styles.ratingVal}>{item.averageRating || 'New'}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
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
  greeting: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#8A89A6',
    fontSize: 14,
    marginTop: 4
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#161530',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#24234C'
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#161530',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#24234C'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161530',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#24234C',
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 24
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  emptyCard: {
    backgroundColor: '#161530',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20
  },
  emptyText: {
    color: '#8A89A6',
    fontSize: 14
  },
  featuredCard: {
    width: 200,
    backgroundColor: '#161530',
    borderRadius: 16,
    marginRight: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#24234C',
    overflow: 'hidden'
  },
  featuredImage: {
    width: '100%',
    height: 120
  },
  featuredInfo: {
    padding: 12
  },
  featuredName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  locationText: {
    color: '#8A89A6',
    fontSize: 12,
    marginLeft: 4
  },
  cornerCard: {
    flexDirection: 'row',
    backgroundColor: '#161530',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#24234C',
    overflow: 'hidden',
    height: 110
  },
  cornerImage: {
    width: 100,
    height: 110,
    alignSelf: 'stretch'
  },
  cornerDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between'
  },
  cornerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  cornerDesc: {
    color: '#8A89A6',
    fontSize: 12
  },
  cornerMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dishCard: {
    width: 150,
    backgroundColor: '#161530',
    borderRadius: 16,
    marginRight: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#24234C',
    overflow: 'hidden'
  },
  dishImage: {
    width: '100%',
    height: 100
  },
  dishInfo: {
    padding: 12
  },
  dishName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  dishPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  dishPrice: {
    color: '#FF3E6C',
    fontWeight: 'bold',
    fontSize: 14
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D0C1D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  ratingVal: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold'
  }
});
