import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useAuth } from '../../context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function VendorDashboard() {
  const { user, token, apiUrl, logout } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchAnalytics();
    }, [])
  );

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403 || res.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        logout();
        return;
      }
      const data = await res.json();
      setAnalytics(data);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.vendorName}>{user ? user.name : 'Chef Dashboard'}</Text>
          <Text style={styles.subtext}>Vendor Management Center</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Metric Cards Row */}
        {analytics && (
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Ionicons name="storefront-outline" size={20} color="#FF3E6C" />
              <Text style={styles.metricVal}>{analytics.totalMeals}</Text>
              <Text style={styles.metricLabel}>Total Meals</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="clipboard-outline" size={20} color="#00C49F" />
              <Text style={styles.metricVal}>{analytics.totalReviews}</Text>
              <Text style={styles.metricLabel}>Total Reviews</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.metricVal}>{analytics.averageRating || 'N/A'}</Text>
              <Text style={styles.metricLabel}>Avg Rating</Text>
            </View>
          </View>
        )}

        {/* AI Insight Box */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Feather name="smile" size={20} color="#FFD700" style={{ marginRight: 6 }} />
            <Text style={styles.aiTitle}>Smart AI Sentiment Insight</Text>
          </View>
          <Text style={styles.aiText}>
            {analytics ? analytics.aiInsight : "Gathering review data to run sentiment classification..."}
          </Text>
        </View>

        {/* Sentiment Analysis Graph Breakdown */}
        {analytics && analytics.sentimentStats && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Customer Sentiment Breakdown</Text>
            <View style={styles.sentimentChartContainer}>
              <View style={styles.sentimentColumn}>
                <View style={[styles.sentimentBar, { height: Math.min(analytics.sentimentStats.positive * 20, 100), backgroundColor: '#4CAF50' }]} />
                <Text style={styles.sentimentBarLabel}>Pos ({analytics.sentimentStats.positive})</Text>
              </View>
              <View style={styles.sentimentColumn}>
                <View style={[styles.sentimentBar, { height: Math.min(analytics.sentimentStats.neutral * 20, 100), backgroundColor: '#FFEB3B' }]} />
                <Text style={styles.sentimentBarLabel}>Neu ({analytics.sentimentStats.neutral})</Text>
              </View>
              <View style={styles.sentimentColumn}>
                <View style={[styles.sentimentBar, { height: Math.min(analytics.sentimentStats.negative * 20, 100), backgroundColor: '#F44336' }]} />
                <Text style={styles.sentimentBarLabel}>Neg ({analytics.sentimentStats.negative})</Text>
              </View>
            </View>
          </View>
        )}

        {/* Best & Least Performers */}
        {analytics && (
          <View style={styles.performanceContainer}>
            <View style={styles.perfCard}>
              <Text style={[styles.perfTitle, { color: '#4CAF50' }]}>Most Liked Meal</Text>
              {analytics.mostLikedMeal ? (
                <Text style={styles.perfName}>{analytics.mostLikedMeal.name} ({analytics.mostLikedMeal.averageRating}★)</Text>
              ) : (
                <Text style={styles.perfEmpty}>No feedback yet</Text>
              )}
            </View>
            <View style={styles.perfCard}>
              <Text style={[styles.perfTitle, { color: '#F44336' }]}>Least Liked Meal</Text>
              {analytics.leastLikedMeal ? (
                <Text style={styles.perfName}>{analytics.leastLikedMeal.name} ({analytics.leastLikedMeal.averageRating}★)</Text>
              ) : (
                <Text style={styles.perfEmpty}>No feedback yet</Text>
              )}
            </View>
          </View>
        )}

        {/* Action Panel */}
        <Text style={styles.sectionHeader}>Management Panel</Text>
        
        <TouchableOpacity style={styles.actionRowBtn} onPress={() => router.push('/(vendor)/manage-corners')}>
          <Ionicons name="storefront-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Manage Food Corners</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRowBtn} onPress={() => router.push('/(vendor)/manage-meals')}>
          <Ionicons name="clipboard-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Manage Meal Menus</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0C1D',
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24
  },
  vendorName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold'
  },
  subtext: {
    color: '#8A89A6',
    fontSize: 14,
    marginTop: 4
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 62, 108, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FF3E6C'
  },
  logoutText: {
    color: '#FF3E6C',
    fontWeight: 'bold',
    fontSize: 12
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#161530',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#24234C'
  },
  metricVal: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 6
  },
  metricLabel: {
    color: '#8A89A6',
    fontSize: 10,
    textAlign: 'center'
  },
  aiCard: {
    backgroundColor: '#161530',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
    marginBottom: 20
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  aiTitle: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 15
  },
  aiText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20
  },
  sectionCard: {
    backgroundColor: '#161530',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#24234C',
    marginBottom: 20
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15
  },
  sentimentChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10
  },
  sentimentColumn: {
    alignItems: 'center',
    width: 60
  },
  sentimentBar: {
    width: 24,
    borderRadius: 6,
    minHeight: 10
  },
  sentimentBarLabel: {
    color: '#8A89A6',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center'
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  perfCard: {
    flex: 1,
    backgroundColor: '#161530',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#24234C',
    marginHorizontal: 4
  },
  perfTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6
  },
  perfName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  perfEmpty: {
    color: '#8A89A6',
    fontSize: 12
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161530',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#24234C',
    height: 54,
    paddingHorizontal: 20,
    marginBottom: 12
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16
  }
});
