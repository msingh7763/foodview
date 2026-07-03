import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../../context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, token, apiUrl, logout } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  async function fetchMyReviews() {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/reviews/my-reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        {user && (
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Past Reviews</Text>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeText}>{reviews.length}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF3E6C" style={{ marginTop: 20 }} />
        ) : reviews.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="message-square" size={36} color="#5C5B7A" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>You haven't reviewed any meals yet.</Text>
          </View>
        ) : (
          reviews.map(review => (
            <TouchableOpacity
              key={review._id}
              style={styles.reviewCard}
              onPress={() => review.mealId && router.push(`/(customer)/meal/${review.mealId._id}`)}
            >
              {review.mealId && (
                <View style={styles.mealMeta}>
                  <Image
                    source={{ uri: review.mealId.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100' }}
                    style={styles.mealThumb}
                  />
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{review.mealId.name}</Text>
                    <View style={styles.ratingRow}>
                      {[...Array(review.rating)].map((_, i) => (
                        <Ionicons key={i} name="star" size={12} color="#FFD700" style={{ marginRight: 2 }} />
                      ))}
                    </View>
                  </View>
                </View>
              )}
              <Text style={styles.reviewText}>{review.reviewText}</Text>
            </TouchableOpacity>
          ))
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
  profileCard: {
    backgroundColor: '#161530',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#24234C',
    marginBottom: 30
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF3E6C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  userEmail: {
    color: '#8A89A6',
    fontSize: 14,
    marginTop: 4
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 62, 108, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 12
  },
  roleText: {
    color: '#FF3E6C',
    fontSize: 12,
    fontWeight: 'bold'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  badgeCount: {
    backgroundColor: '#FF3E6C',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  emptyCard: {
    backgroundColor: '#161530',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#24234C'
  },
  emptyText: {
    color: '#8A89A6',
    fontSize: 14
  },
  reviewCard: {
    backgroundColor: '#161530',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#24234C'
  },
  mealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  mealThumb: {
    width: 40,
    height: 40,
    borderRadius: 8
  },
  mealInfo: {
    marginLeft: 12
  },
  mealName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: 4
  },
  reviewText: {
    color: '#C5C5D8',
    fontSize: 14,
    lineHeight: 20
  },
  logoutBtn: {
    backgroundColor: '#161530',
    borderWidth: 1,
    borderColor: '#FF3E6C',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30
  },
  logoutText: {
    color: '#FF3E6C',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
