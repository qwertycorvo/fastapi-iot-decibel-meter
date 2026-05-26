import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation, onLogout }) {
  const [dbValue, setDbValue] = useState(82);
  const [highestDb, setHighestDb] = useState(105.0);
  const [load, setLoad] = useState('Moderate');
  const [history, setHistory] = useState(Array.from({ length: 20 }, () => 40 + Math.random() * 40));

  useEffect(() => {
    const id = setInterval(() => {
      const next = Math.max(35, Math.min(110, Math.round(dbValue + (Math.random() * 16 - 8))));
      setDbValue(next);
      if (next > highestDb) setHighestDb(next);
      
      const pct = (next - 35) / 75;
      if (pct < 0.35) setLoad('Low');
      else if (pct < 0.7) setLoad('Moderate');
      else setLoad('High');

      setHistory(prev => [...prev.slice(1), next]);
    }, 1500);
    return () => clearInterval(id);
  }, [dbValue, highestDb]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Smart IoT Decibel Monitoring System</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout 🚪</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Smart IoT</Text>
          </View>
          <Text style={styles.heroTitle}>Cagayan De Oro City Streets</Text>
          <Text style={styles.heroSubtitle}>Real-time noise insights across Cagayan de Oro City streets.</Text>
          
          <View style={styles.heroMetrics}>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricLabel}>Live</Text>
              <Text style={styles.heroMetricValue}>{dbValue} dB</Text>
            </View>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricLabel}>Highest</Text>
              <Text style={styles.heroMetricValue}>{highestDb.toFixed(1)} dB</Text>
            </View>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricLabel}>Load</Text>
              <Text style={[styles.heroMetricValue, { color: load === 'High' ? '#f87171' : load === 'Moderate' ? '#fbbf24' : '#4ade80' }]}>{load}</Text>
            </View>
          </View>

          {/* Mini Chart Graphic in Hero - Pure CSS/View */}
          <View style={styles.heroGraphic}>
            {[1,2,3,4,5,6,7,8,9,10].map((i) => (
              <View key={i} style={[styles.graphicBar, { height: 10 + (i * 4) }]} />
            ))}
          </View>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Sensors</Text>
            <Text style={styles.statValue}>{activeSensors}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Highest dB</Text>
            <Text style={styles.statValue}>{highestDb.toFixed(1)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Violations Today</Text>
            <Text style={styles.statValue}>{violationsToday}</Text>
          </View>
        </View>

        {/* Safe Chart Section - Built with Views to avoid SVG crashes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Decibel Levels (Last Minute)</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartYAxis}>
              <Text style={styles.chartLabel}>110</Text>
              <Text style={styles.chartLabel}>75</Text>
              <Text style={styles.chartLabel}>35</Text>
            </View>
            <View style={styles.chartPlot}>
              {history.map((val, index) => {
                const barHeight = ((val - 35) / 75) * 100;
                return (
                  <View key={index} style={styles.barWrapper}>
                    <View style={[styles.bar, { height: `${Math.max(5, barHeight)}%` }]} />
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Sensor Location Map Placeholder */}
        <View style={styles.section}>
          <View style={styles.mapHeader}>
            <Text style={styles.sectionTitle}>Sensor Location Map</Text>
            <View style={styles.mapLegend}>
              <View style={[styles.legendDot, { backgroundColor: '#38bdf8' }]} />
              <Text style={styles.legendText}>Normal</Text>
              <View style={[styles.legendDot, { backgroundColor: '#f87171' }]} />
              <Text style={styles.legendText}>High Noise</Text>
            </View>
          </View>
          <View style={styles.mapView}>
            <View style={styles.mapPin}>
              <Text style={styles.pinIcon}>📍</Text>
              <View style={styles.pinLabel}>
                <Text style={styles.pinText}>Building B - Floor 3</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.navButtonText}>View All Reports</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#0b3a72', flex: 1 },
  logoutButton: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  logoutText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  container: { flex: 1 },
  hero: { backgroundColor: '#0b3a72', padding: 25, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, position: 'relative' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 15 },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#38bdf8', marginRight: 8 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: '600' },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  heroSubtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 25, maxWidth: '80%' },
  heroMetrics: { flexDirection: 'row', justifyContent: 'space-between' },
  heroMetricCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, width: (width - 70) / 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heroMetricLabel: { color: '#94a3b8', fontSize: 11, marginBottom: 4 },
  heroMetricValue: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  heroGraphic: { position: 'absolute', right: 20, bottom: 80, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  graphicBar: { width: 5, backgroundColor: '#38bdf8', opacity: 0.6, borderRadius: 2 },
  statsRow: { flexDirection: 'row', padding: 15, gap: 10, marginTop: 5 },
  statCard: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  statLabel: { fontSize: 11, color: '#64748b', marginBottom: 4, textAlign: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#0b3a72' },
  section: { padding: 20, backgroundColor: 'white', marginHorizontal: 15, marginTop: 15, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 1 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  chartContainer: { height: 120, flexDirection: 'row' },
  chartYAxis: { width: 30, justifyContent: 'space-between', paddingVertical: 5 },
  chartLabel: { fontSize: 10, color: '#94a3b8' },
  chartPlot: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#f1f5f9', paddingLeft: 5 },
  barWrapper: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar: { width: '70%', backgroundColor: '#6366f1', borderTopLeftRadius: 2, borderTopRightRadius: 2, opacity: 0.8 },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  mapLegend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: '#64748b', marginRight: 5 },
  mapView: { height: 150, backgroundColor: '#f1f5f9', borderRadius: 8, position: 'relative', overflow: 'hidden' },
  mapPin: { position: 'absolute', top: 40, left: '50%', alignItems: 'center' },
  pinIcon: { fontSize: 24 },
  pinLabel: { backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: -5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  pinText: { fontSize: 10, color: '#1e293b', fontWeight: 'bold' },
  navButton: { margin: 20, backgroundColor: '#0b3a72', padding: 15, borderRadius: 8, alignItems: 'center' },
  navButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
