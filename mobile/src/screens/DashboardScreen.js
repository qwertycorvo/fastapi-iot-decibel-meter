import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import { fetchStats, getPrediction, fetchViolations } from '../api';

const { width } = Dimensions.get('window');

const mapPositions = [
  { x: 36, y: 34, label: 'Divisoria Plaza' },
  { x: 60, y: 30, label: 'Cogon Market' },
  { x: 70, y: 52, label: 'Limketkai Center' },
  { x: 52, y: 44, label: 'Centrio Mall' },
  { x: 42, y: 58, label: 'Xavier University' },
  { x: 26, y: 62, label: 'City Hall' },
];

export default function DashboardScreen({ navigation, onLogout }) {
  const [dbValue, setDbValue] = useState(45);
  const [highestDb, setHighestDb] = useState(0);
  const [activeSensors, setActiveSensors] = useState(0);
  const [violationsToday, setViolationsToday] = useState(0);
  const [load, setLoad] = useState('Low');
  const [prediction, setPrediction] = useState(null);
  const [recentViolations, setRecentViolations] = useState([]);
  const [history, setHistory] = useState(Array.from({ length: 20 }, () => 35));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch real-time stats
        const stats = await fetchStats();
        if (stats) {
          setHighestDb(stats.highestDb);
          setActiveSensors(stats.activeSensors);
          setViolationsToday(stats.violationsToday);
          
          // Use a simulated live value based on highest or a slight variation
          // Since the ESP32 updates highestDb, we can use it as our baseline
          const live = Math.max(35, Math.round(stats.highestDb - (Math.random() * 10)));
          setDbValue(live);

          // 2. Fetch AI Prediction
          const hour = new Date().getHours();
          const pred = await getPrediction(live, hour);
          setPrediction(pred);

          // 3. Update history for chart
          setHistory(prev => [...prev.slice(1), live]);

          // Update load level
          const pct = (live - 35) / 75;
          if (pct < 0.35) setLoad('Low');
          else if (pct < 0.7) setLoad('Moderate');
          else setLoad('High');
        }

        // 4. Fetch recent violations
        const violations = await fetchViolations();
        if (violations && violations.length > 0) {
          setRecentViolations(violations.slice(-3).reverse());
        }
      } catch (error) {
        console.error("Dashboard data fetch failed:", error);
      }
    };

    fetchData(); // Initial load
    const id = setInterval(fetchData, 5000); // Sync every 5 seconds
    return () => clearInterval(id);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Smart IoT Decibel Monitoring System</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout 🚪</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section - Matching Web Dashboard */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Smart IoT</Text>
          </View>
          <Text style={styles.heroTitle}>Cagayan De Oro City Streets</Text>
          <Text style={styles.heroSubtitle}>Real‑time noise insights across Cagayan de Oro City streets.</Text>
          
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

          {prediction && (
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>AI Impact:</Text>
              <Text style={[styles.predictionValue, { color: prediction.category === 'Critical' ? '#f87171' : '#fbbf24' }]}>
                {prediction.category} ({(prediction.confidence * 100).toFixed(0)}%)
              </Text>
            </View>
          )}

          {/* Mini EQ Graphic */}
          <View style={styles.miniEq}>
            {[1,2,3,4,5,6,7,8].map((i) => (
              <View key={i} style={[styles.eqBar, { height: 10 + (Math.random() * 20) }]} />
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

        {/* Decibel Chart */}
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

        {/* CDO Sensor Map */}
        <View style={styles.section}>
          <View style={styles.mapHeader}>
            <View>
              <Text style={styles.sectionTitle}>Sensor Location Map</Text>
              <Text style={styles.mapSubtitle}>Cagayan De Oro City View</Text>
            </View>
            <View style={styles.mapLegend}>
              <View style={[styles.legendDot, { backgroundColor: '#38bdf8' }]} />
              <Text style={styles.legendText}>Normal</Text>
            </View>
          </View>
          
          <View style={styles.campusMap}>
            <View style={styles.mapBackground}>
              {/* Abstract City Blocks */}
              <View style={[styles.mapBlock, { left: '10%', top: '20%', width: '20%', height: '30%' }]} />
              <View style={[styles.mapBlock, { left: '50%', top: '10%', width: '30%', height: '20%' }]} />
              <View style={[styles.mapBlock, { left: '40%', top: '50%', width: '40%', height: '25%' }]} />
              <View style={styles.mapPath} />
            </View>

            {mapPositions.map((pos, idx) => (
              <View key={idx} style={[styles.mapPin, { left: `${pos.x}%`, top: `${pos.y}%` }]}>
                <View style={styles.pinDot} />
                <View style={styles.pinLabel}>
                  <Text style={styles.pinText}>{pos.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Violations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Violations</Text>
          {recentViolations.length > 0 ? (
            recentViolations.map((v, i) => (
              <View key={i} style={styles.violationItem}>
                <Text style={styles.violationText}>{v.time} - {v.sensor}</Text>
                <Text style={styles.violationLevel}>{v.level} dB</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No violations recorded today.</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.navButtonText}>Manage Reports</Text>
        </TouchableOpacity>
        
        <View style={{ height: 30 }} />
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
  headerTitle: { fontSize: 13, fontWeight: 'bold', color: '#0b3a72', flex: 1 },
  logoutButton: { backgroundColor: '#fef2f2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  logoutText: { fontSize: 11, color: '#ef4444', fontWeight: '600' },
  container: { flex: 1 },
  
  // Hero Section
  hero: { backgroundColor: '#0b3a72', padding: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, position: 'relative', overflow: 'hidden' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#38bdf8', marginRight: 6 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  heroSubtitle: { fontSize: 12, color: '#94a3b8', marginBottom: 20 },
  heroMetrics: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  heroMetricCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heroMetricLabel: { color: '#94a3b8', fontSize: 10, marginBottom: 4, textTransform: 'uppercase' },
  heroMetricValue: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  
  predictionRow: { flexDirection: 'row', marginTop: 15, alignItems: 'center', gap: 8 },
  predictionLabel: { color: '#94a3b8', fontSize: 12 },
  predictionValue: { fontSize: 12, fontWeight: 'bold' },

  miniEq: { position: 'absolute', right: -10, top: 20, flexDirection: 'row', alignItems: 'flex-end', gap: 4, transform: [{ rotate: '180deg' }], opacity: 0.2 },
  eqBar: { width: 4, backgroundColor: 'white', borderRadius: 2 },

  // Stats
  statsRow: { flexDirection: 'row', padding: 15, gap: 10 },
  statCard: { flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  statLabel: { fontSize: 10, color: '#64748b', marginBottom: 4, textAlign: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#0b3a72' },

  // Sections
  section: { padding: 20, backgroundColor: 'white', marginHorizontal: 15, marginBottom: 15, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 15, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  
  // Chart
  chartContainer: { height: 140, flexDirection: 'row', marginTop: 10 },
  chartYAxis: { width: 25, justifyContent: 'space-between', paddingVertical: 5 },
  chartLabel: { fontSize: 9, color: '#94a3b8' },
  chartPlot: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#f1f5f9', paddingLeft: 5 },
  barWrapper: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar: { width: '60%', backgroundColor: '#6366f1', borderTopLeftRadius: 4, borderTopRightRadius: 4, opacity: 0.8 },

  // Map
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  mapSubtitle: { fontSize: 11, color: '#64748b' },
  mapLegend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: '#64748b' },
  
  campusMap: { height: 200, backgroundColor: '#f8fafc', borderRadius: 15, position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
  mapBackground: { ...StyleSheet.absoluteFillObject, opacity: 0.1 },
  mapBlock: { position: 'absolute', backgroundColor: '#0b3a72', borderRadius: 4 },
  mapPath: { position: 'absolute', top: '45%', width: '100%', height: 10, backgroundColor: '#cbd5e1' },
  
  mapPin: { position: 'absolute', alignItems: 'center' },
  pinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#38bdf8', borderWidth: 2, borderColor: 'white' },
  pinLabel: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2 },
  pinText: { fontSize: 8, color: '#1e293b', fontWeight: 'bold' },

  // Violations
  violationItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  violationText: { fontSize: 12, color: '#475569' },
  violationLevel: { fontSize: 12, fontWeight: 'bold', color: '#ef4444' },
  emptyText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },

  navButton: { margin: 15, backgroundColor: '#0b3a72', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#0b3a72', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  navButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
