import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import Button from '../../components/Button';
import Card from '../../components/Card';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const isSmallScreen = width < 500;
  const contentMaxWidth = 500;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Card style={styles.logoCard}>
            <Image
              source={require('../../../assets/images/logo-nobk.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Card>
        </View>

        {/* Content */}
        <View style={[styles.contentWrapper, { maxWidth: contentMaxWidth }]}>
          <Text style={[styles.headline, isSmallScreen && styles.headlineSmall]}>
            Find Pharmacies Near You
          </Text>
          
          <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
            Locate nearby pharmacies, check availability, and get medicine fast
          </Text>

          {/* Features Card */}
          <Card style={styles.featuresCard}>
            <View style={styles.featureList}>
              <FeatureItem 
                title="Quick Location" 
                description="Find nearby pharmacies instantly"
              />
              <FeatureItem 
                title="Check Hours" 
                description="See if they are open now"
              />
              <FeatureItem 
                title="Easy Search" 
                description="Search by name or location"
              />
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionSection, { maxWidth: contentMaxWidth }]}>
          <Button
            title="Sign In"
            onPress={() => navigation.navigate('Login', { role: 'customer' })}
            variant="primary"
            fullWidth
          />

          <Button
            title="Browse Without Login"
            onPress={() => navigation.navigate('GuestCustomerApp')}
            variant="outline"
            fullWidth
          />
          
          <View style={styles.divider} />

          <Button
            title="Sign Up"
            onPress={() => navigation.navigate('Signup', { role: 'customer' })}
            variant="outline"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const FeatureItem = ({ title, description }) => (
  <View style={featureStyles.container}>
    <View style={featureStyles.bulletContainer}>
      <View style={featureStyles.bullet} />
    </View>
    <View style={featureStyles.content}>
      <Text style={featureStyles.title}>{title}</Text>
      <Text style={featureStyles.description}>{description}</Text>
    </View>
  </View>
);

const featureStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  bulletContainer: {
    marginRight: spacing.md,
    marginTop: spacing.sm,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.lg,
  },
  logoCard: {
    padding: 0,
    borderWidth: 0,
  },
  logo: {
    width: 120,
    height: 120,
  },
  contentWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  headline: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.text,
  },
  headlineSmall: {
    fontSize: 24,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  subtitleSmall: {
    fontSize: 14,
  },
  featuresCard: {
    marginBottom: spacing.xxl,
  },
  featureList: {
    gap: 0,
  },
  actionSection: {
    gap: spacing.md,
    width: '100%',
    alignSelf: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
});

export default WelcomeScreen;
