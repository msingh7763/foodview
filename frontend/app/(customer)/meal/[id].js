import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../context';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function MealDetail() {
  const { id } = useLocalSearchParams();
  const { user, token, apiUrl } = useAuth();
  const router = useRouter();

  const [meal, setMeal] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit review fields
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMealDetails();
  }, [id]);

  async function fetchMealDetails() {
    try {
      setLoading(true);
      // Fetch Single Meal Details
      const resMeal = await fetch(`${apiUrl}/meals/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resMeal.ok) throw new Error('Meal fetch failed');
      const mealData = await resMeal.json();
      setMeal(mealData);

      // Fetch Reviews
      const resReviews = await fetch(`${apiUrl}/reviews?mealId=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reviewsData = await resReviews.json();
      if (Array.isArray(reviewsData)) setReviews(reviewsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handlePostReview() {
    if (!reviewText.trim()) {
      Alert.alert('Validation Error', 'Please write a review message');
      return;
    }

    setSubmitting(true);
    try {
      if (editingReviewId) {
        // Update review
        const response = await fetch(`${apiUrl}/reviews/${editingReviewId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ rating, reviewText })
        });
        if (!response.ok) throw new Error('Failed to update review');
      } else {
        // Create new review
        const response = await fetch(`${apiUrl}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ mealId: id, rating, reviewText })
        });
        if (!response.ok) throw new Error('Failed to create review');
      }

      // Reset states and refresh
      setReviewText('');
      setRating(5);
      setEditingReviewId(null);
      await fetchMealDetails();
      Alert.alert('Success', 'Review saved successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Error processing review');
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditPress(review) {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setReviewText(review.reviewText);
  }

  async function handleDeleteReview(reviewId) {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${apiUrl}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!response.ok) throw new Error('Delete failed');
              await fetchMealDetails();
            } catch (error) {
              Alert.alert('Error', 'Unable to delete review');
            }
          }
        }
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3E6C" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Meal not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Banner / Cover Image */}
      <Image
        source={{ uri: meal.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' }}
        style={styles.bannerImage}
      />

      {/* Floating Back Action */}
      <TouchableOpacity style={styles.headerBackBtn} onPress={() => router.back()}>
        <Feather name="chevron-left" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{meal.name}</Text>
            <Text style={styles.price}>${meal.price.toFixed(2)}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFD700" style={{ marginRight: 4 }} />
            <Text style={styles.ratingVal}>{meal.averageRating || 'New'}</Text>
            <Text style={styles.reviewsCount}>({reviews.length} reviews)</Text>
          </View>

          <Text style={styles.description}>{meal.description}</Text>

          {/* Add/Edit Review Section for Customers */}
          {user && user.role === 'Customer' && (
            <View style={styles.writeReviewSection}>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>
                {editingReviewId ? 'Edit Your Review' : 'Rate & Review this Meal'}
              </Text>

              {/* Star Rating Selector */}
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(starNum => (
                  <TouchableOpacity key={starNum} onPress={() => setRating(starNum)}>
                    <Ionicons
                      name="star"
                      size={32}
                      color={starNum <= rating ? '#FFD700' : '#5C5B7A'}
                      style={{ marginRight: 8 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.reviewInput}
                placeholder="Share your experience (e.g. delicious taste, fast service...)"
                placeholderTextColor="#5C5B7A"
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={3}
              />

              <View style={styles.reviewActions}>
                <TouchableOpacity
                  style={[styles.submitBtn, submitting && styles.btnDisabled]}
                  onPress={handlePostReview}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {editingReviewId ? 'Update Review' : 'Submit Review'}
                    </Text>
                  )}
                </TouchableOpacity>

                {editingReviewId && (
                  <TouchableOpacity
                    style={styles.cancelEditBtn}
                    onPress={() => {
                      setEditingReviewId(null);
                      setRating(5);
                      setReviewText('');
                    }}
                  >
                    <Text style={styles.cancelEditText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Reviews List */}
          <Text style={styles.sectionTitle}>Customer Feedback</Text>
          {reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyText}>Be the first to review this meal!</Text>
            </View>
          ) : (
            reviews.map(review => {
              const isOwner = user && review.userId && review.userId._id === user.id;
              // Determine sentiment tag colors
              const sentimentColors = {
                positive: { text: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)' },
                neutral: { text: '#FFEB3B', bg: 'rgba(255, 235, 59, 0.1)' },
                negative: { text: '#F44336', bg: 'rgba(244, 67, 54, 0.1)' }
              };
              const sentimentStyle = sentimentColors[review.sentiment] || sentimentColors.neutral;

              return (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View>
                      <Text style={styles.reviewerName}>
                        {review.userId ? review.userId.name : 'Anonymous'}
                      </Text>
                      <View style={styles.ratingRow}>
                        {[...Array(review.rating)].map((_, i) => (
                          <Ionicons key={i} name="star" size={12} color="#FFD700" style={{ marginRight: 2 }} />
                        ))}
                      </View>
                    </View>

                    {/* AI Sentiment Analysis Badge */}
                    <View style={[styles.sentimentBadge, { backgroundColor: sentimentStyle.bg }]}>
                      <Text style={[styles.sentimentText, { color: sentimentStyle.text }]}>
                        {review.sentiment ? review.sentiment.toUpperCase() : 'NEUTRAL'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.reviewBody}>{review.reviewText}</Text>

                  {/* Actions for review owner */}
                  {isOwner && (
                    <View style={styles.ownerActions}>
                      <TouchableOpacity style={styles.ownerBtn} onPress={() => handleEditPress(review)}>
                        <Feather name="edit-2" size={16} color="#8A89A6" />
                        <Text style={styles.ownerBtnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.ownerBtn} onPress={() => handleDeleteReview(review._id)}>
                        <Feather name="trash-2" size={16} color="#FF3E6C" />
                        <Text style={[styles.ownerBtnText, { color: '#FF3E6C' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10
  },
  price: {
    color: '#FF3E6C',
    fontSize: 22,
    fontWeight: 'bold'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  ratingVal: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 15
  },
  reviewsCount: {
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
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  writeReviewSection: {
    marginTop: 10
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16
  },
  reviewInput: {
    backgroundColor: '#161530',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#24234C',
    color: '#FFFFFF',
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 15
  },
  reviewActions: {
    flexDirection: 'row',
    marginTop: 12
  },
  submitBtn: {
    backgroundColor: '#FF3E6C',
    borderRadius: 8,
    height: 40,
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
  cancelEditBtn: {
    backgroundColor: '#161530',
    borderWidth: 1,
    borderColor: '#24234C',
    borderRadius: 8,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  cancelEditText: {
    color: '#8A89A6',
    fontWeight: 'bold',
    fontSize: 14
  },
  btnDisabled: {
    opacity: 0.6
  },
  emptyReviews: {
    backgroundColor: '#161530',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center'
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  reviewerName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold'
  },
  sentimentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  sentimentText: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  reviewBody: {
    color: '#C5C5D8',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10
  },
  ownerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#24234C',
    paddingTop: 10
  },
  ownerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16
  },
  ownerBtnText: {
    color: '#8A89A6',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: 'bold'
  }
});
