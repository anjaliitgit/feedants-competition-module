import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {Ionicons} from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';

import Card from '../components/Card';
import Countdown from '../components/Countdown';
import {api} from '../services/api';
import {colors} from '../theme/colors';


const fallback = {
  slug: 'demo-classical-dance',
  title: 'Feedants Classical Dance',
  tags: ['Dance', 'Multi-Win'],
  certificateText: 'Winners get certificate',

  prizePool: 1500,
  entryFee: 99,
  maxParticipants: 20,
  registeredCount: 1,

  lifecycle: 'registration_open',
  status: 'registration_open',

  remainingSpots: 19,
  isRegistered: true,

  registrationClosesAt:
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),

  submissionStartsAt:
    new Date(Date.now() - 60 * 60 * 1000).toISOString(),

  submissionEndsAt:
    new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),

  judge: {
    name: 'Manju Dubey',
    role: 'Professional Kathak Dancer',
    experience: '12+ Years of Experience',
    imageUrl: '',
    introVideoUrl: ''
  },

  dates: {
    registerBefore: '29 Sep 26',
    registerTime: '11:50 PM',
    submissionStarts: '28 Sep 26',
    submissionStartsTime: '04:00 AM',
    submissionEnds: '30 Sep 26',
    submissionEndsTime: '11:55 PM',
    resultDate: '1 Oct 26',
    resultTime: '11:50 PM'
  },

  winners: [
    {
      name: 'Riya Shah',
      position: '1st Winner'
    },
    {
      name: 'Aarav Mehta',
      position: '1st Winner'
    },
    {
      name: 'Neha Verma',
      position: '2nd Winner'
    },
    {
      name: 'Ishita Chopra',
      position: '3rd Winner'
    }
  ],

  about:
    'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',

  judging:
    'Participants are evaluated on technique, expression, presentation and overall performance.',

  rules:
    'Open to all age groups. Submit an original performance within the submission window. Paid registration is required for judging.',

  rewards: [
    {
      position: '1st Winner',
      amount: 550
    },
    {
      position: '2nd Winner',
      amount: 300
    },
    {
      position: '3rd Winner',
      amount: 240
    },
    {
      position: '4th Winner',
      amount: 200
    },
    {
      position: '5th Winner',
      amount: 130
    },
    {
      position: '6th Winner',
      amount: 80
    }
  ]
};


function Pill({children}) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{children}</Text>
    </View>
  );
}


function SectionTitle({children}) {
  return (
    <Text style={styles.sectionTitle}>
      {children}
    </Text>
  );
}


function DateBox({icon, title, date, time}) {
  return (
    <View style={styles.dateBox}>
      <Ionicons
        name={icon}
        size={25}
        color={colors.teal}
      />

      <View
        style={{
          marginLeft: 10,
          flex: 1
        }}
      >
        <Text style={styles.dateLabel}>
          {title}
        </Text>

        <Text style={styles.dateValue}>
          {date}
        </Text>

        <Text style={styles.time}>
          {time}
        </Text>
      </View>
    </View>
  );
}


export default function CompetitionDetailsScreen() {

  const [competition, setCompetition] = useState(fallback);

  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState('About Competition');

  // Stores the user's existing submission
  const [submission, setSubmission] = useState(null);

  // Functional UI states
  const [language, setLanguage] = useState('en');
  const [expanded, setExpanded] = useState(false);


  /*
   * LOAD COMPETITION
   *
   * 1. Get competition from backend
   * 2. Check whether user is registered
   * 3. If registered, check whether user already submitted
   */
  useEffect(() => {

    async function loadCompetition() {

      try {

        const response = await api(
          '/competitions/demo-classical-dance'
        );

        const competitionData = response.competition;

        setCompetition(competitionData);


        /*
         * If the user is registered,
         * check whether they already uploaded a submission.
         */
        if (competitionData.isRegistered) {

          try {

            const submissionResponse = await api(
              `/competitions/${competitionData.slug}/submissions/me`
            );

            setSubmission(
              submissionResponse.submission
            );

          } catch (error) {

            console.log(
              'No existing submission found'
            );

            setSubmission(null);
          }
        }

      } catch (error) {

        console.log(
          'Competition loading failed:',
          error
        );

      } finally {

        setLoading(false);

      }
    }


    loadCompetition();

  }, []);


  /*
   * REGISTER USER
   */
  async function register() {

    setBusy(true);

    try {

      const response = await api(
        `/competitions/${competition.slug}/register`,
        {
          method: 'POST'
        }
      );

      setCompetition(
        response.competition
      );

      Alert.alert(
        'Registration',
        'You are registered successfully.'
      );

    } catch (error) {

      Alert.alert(
        'Registration',
        error.message || 'Registration failed.'
      );

    } finally {

      setBusy(false);

    }
  }


  /*
   * UPLOAD SUBMISSION
   */
  async function uploadSubmission() {

    try {

      setBusy(true);


      /*
       * Open device/browser file picker
       */
      const result =
        await DocumentPicker.getDocumentAsync({

          type: [
            'video/mp4',
            'video/quicktime',
            'video/webm',
            'image/jpeg',
            'image/png'
          ],

          copyToCacheDirectory: true

        });


      /*
       * User cancelled file picker
       */
      if (result.canceled) {

        setBusy(false);

        return;
      }


      /*
       * Get selected file
       */
      const asset = result.assets[0];


      if (!asset || !asset.uri) {

        throw new Error(
          'No file was selected.'
        );
      }


      /*
       * Create multipart form data
       */
      const formData = new FormData();


      /*
       * WEB
       *
       * Browser needs Blob/File.
       */
      if (Platform.OS === 'web') {

        const fileResponse =
          await fetch(asset.uri);

        const blob =
          await fileResponse.blob();


        formData.append(
          'file',
          blob,
          asset.name ||
            `submission-${Date.now()}`
        );

      }


      /*
       * ANDROID / IOS
       *
       * React Native accepts
       * { uri, name, type }.
       */
      else {

        formData.append(
          'file',
          {
            uri: asset.uri,

            name:
              asset.name ||
              `submission-${Date.now()}`,

            type:
              asset.mimeType ||
              'application/octet-stream'
          }
        );
      }


      /*
       * Optional submission title
       */
      formData.append(
        'title',
        'Competition Submission'
      );


      /*
       * Send file to backend
       */
      const response = await api(
        `/competitions/${competition.slug}/submissions`,
        {
          method: 'POST',
          body: formData
        }
      );


      /*
       * Save returned submission
       */
      setSubmission(
        response.submission
      );


      Alert.alert(
        'Submission',
        'Your submission has been uploaded successfully.'
      );


    } catch (error) {

      console.error(
        'Upload failed:',
        error
      );


      Alert.alert(
        'Upload Failed',
        error.message ||
          'Could not upload submission.'
      );

    } finally {

      setBusy(false);

    }
  }


  /*
   * BACK BUTTON
   */
  function handleBack() {

    if (Platform.OS === 'web') {

      if (
        typeof window !== 'undefined' &&
        window.history.length > 1
      ) {

        window.history.back();

      } else {

        Alert.alert(
          'Navigation',
          'You are already on the first screen.'
        );

      }

      return;
    }


    Alert.alert(
      'Go Back',
      'You are currently viewing the competition details.',
      [
        {
          text: 'Stay',
          style: 'cancel'
        },
        {
          text: 'Close',
          onPress: () => {}
        }
      ]
    );
  }


  /*
   * LANGUAGE TOGGLE
   */
  function toggleLanguage(value) {

    setLanguage(value);

    Alert.alert(
      value === 'hi'
        ? 'भाषा'
        : 'Language',

      value === 'hi'
        ? 'हिंदी भाषा चुनी गई है।'
        : 'English language selected.'
    );
  }


  /*
   * JUDGE INTRO VIDEO
   */
  async function openJudgeVideo() {

    const url =
      competition?.judge?.introVideoUrl;

    if (!url) {

      Alert.alert(
        'Intro Video',
        'Judge introduction video is not available yet.'
      );

      return;
    }


    try {

      await Linking.openURL(url);

    } catch (error) {

      Alert.alert(
        'Video',
        'Unable to open the introduction video.'
      );

    }
  }


  /*
   * COPY REFERRAL LINK
   */
  async function copyReferralLink() {

    const referralLink =
      'https://feedants.com/r/referral123';

    try {

      await Clipboard.setStringAsync(
        referralLink
      );

      Alert.alert(
        'Referral Link',
        'Referral link copied successfully.'
      );

    } catch (error) {

      Alert.alert(
        'Referral Link',
        'Could not copy the referral link.'
      );
    }
  }


  /*
   * SHARE REFERRAL LINK
   */
  async function shareReferralLink() {

    const referralLink =
      'https://feedants.com/r/referral123';

    try {

      await Share.share({
        message:
          `Join me on Feedants! ${referralLink}`
      });

    } catch (error) {

      console.log(
        'Share cancelled or failed:',
        error
      );
    }
  }


  /*
   * PAYMENT INFORMATION
   */
  function showPaymentInfo() {

    Alert.alert(
      'Payment Information',

      `Entry fee: ₹${competition.entryFee}\n\n` +
      'Secure payments are handled through the configured payment gateway.\n\n' +
      'Please complete registration before submitting your entry.'
    );
  }


  /*
   * PARTICIPANT REVIEWS
   */
  async function showReviews() {

    try {

      const response = await api(
        `/competitions/${competition.slug}/reviews`
      );

      const reviews =
        response.reviews || [];

      if (!reviews.length) {

        Alert.alert(
          'Participant Reviews',
          'No reviews have been submitted yet.'
        );

        return;
      }


      const reviewText =
        reviews
          .slice(0, 5)
          .map(
            review =>
              `${review.userId?.name || 'Participant'} — ${review.rating}/5\n${review.comment || 'No comment'}`
          )
          .join('\n\n');


      Alert.alert(
        `Participant Reviews (${response.count || reviews.length})`,
        `Average rating: ${response.averageRating || 0}/5\n\n${reviewText}`
      );

    } catch (error) {

      Alert.alert(
        'Participant Reviews',
        error.message ||
          'Could not load reviews.'
      );
    }
  }


  /*
   * REGISTRATION STATE
   *
   * Backend status must be registration_open
   * Registration closing date must still be future
   * Competition must not be full
   * User must not already be registered
   */
  const canRegister =
    competition.status === 'registration_open' &&
    competition.registrationClosesAt &&
    new Date(
      competition.registrationClosesAt
    ) > new Date() &&
    !competition.isFull &&
    !competition.isRegistered;


  /*
   * SUBMISSION WINDOW
   *
   * User must be registered
   * Current time must be between
   * submission start and submission end
   */
  const submissionOpen =
    competition.isRegistered &&
    competition.submissionStartsAt &&
    competition.submissionEndsAt &&
    new Date() >=
      new Date(competition.submissionStartsAt) &&
    new Date() <=
      new Date(competition.submissionEndsAt);


  /*
   * Does user already have a submission?
   */
  const hasSubmission =
    !!submission;


  /*
   * Button can be clicked if:
   *
   * Registration is available
   * OR
   * Submission window is open
   */
  const buttonEnabled =
    canRegister ||
    submissionOpen;


  /*
   * Current tab content
   */
  const currentTabContent =
    tab === 'About Competition'
      ? competition.about
      : tab === 'Judging Parameters'
      ? competition.judging
      : competition.rules;


  /*
   * LOADING SCREEN
   */
  if (loading) {

    return (
      <View style={styles.loader}>

        <ActivityIndicator
          size="large"
          color={colors.teal}
        />

        <Text style={styles.loadingText}>
          Loading competition...
        </Text>

      </View>
    );
  }


  return (

    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >


      {/* HEADER */}

      <View style={styles.header}>

        <Pressable
          style={styles.back}
          onPress={handleBack}
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.navy}
          />

          <Text style={styles.backText}>
            Go back
          </Text>

        </Pressable>


        <View style={styles.lang}>

          <Pressable
            onPress={() => toggleLanguage('en')}
            style={
              language === 'en'
                ? styles.activeLang
                : styles.hindi
            }
          >
            <Text
              style={{
                color:
                  language === 'en'
                    ? '#fff'
                    : colors.navy,
                fontWeight: '800'
              }}
            >
              ENG
            </Text>
          </Pressable>


          <Pressable
            onPress={() => toggleLanguage('hi')}
            style={
              language === 'hi'
                ? styles.activeLang
                : styles.hindi
            }
          >
            <Text
              style={{
                color:
                  language === 'hi'
                    ? '#fff'
                    : colors.navy,
                fontWeight: '800'
              }}
            >
              हिंदी
            </Text>
          </Pressable>

        </View>

      </View>


      {/* COMPETITION SUMMARY */}

      <Card>

        <View style={styles.titleRow}>

          <Text style={styles.title}>
            {competition.title}
          </Text>


          <View style={styles.registered}>

            <Ionicons
              name={
                competition.isRegistered
                  ? 'checkmark-circle'
                  : 'add-circle-outline'
              }
              size={19}
              color={colors.teal}
            />

            <Text style={styles.registeredText}>

              {competition.isRegistered
                ? 'Registered'
                : 'Register'}

            </Text>

          </View>

        </View>


        <View style={styles.meta}>

          <View
            style={{
              flexDirection: 'row'
            }}
          >

            {competition.tags.map(
              tag => (
                <Pill key={tag}>
                  {tag}
                </Pill>
              )
            )}

          </View>


          <View style={styles.certificate}>

            <Ionicons
              name="trophy-outline"
              size={22}
              color={colors.teal}
            />

            <Text style={styles.certText}>
              {competition.certificateText}
            </Text>

          </View>

        </View>


        <View style={styles.stats}>

          <View>

            <Text style={styles.label}>
              Prize Pool
            </Text>

            <Text style={styles.money}>
              ₹ {competition.prizePool.toLocaleString()}
            </Text>

          </View>


          <View>

            <Text style={styles.label}>
              Entry Fee
            </Text>

            <Text style={styles.money}>
              ₹ {competition.entryFee}
            </Text>

          </View>


          <View style={{flex: 1}}>

            <Text style={styles.spots}>

              <Ionicons
                name="people-outline"
                size={18}
                color={colors.teal}
              />

              {' '}Only {competition.remainingSpots} spots left

            </Text>


            <View style={styles.progress}>

              <View
                style={[
                  styles.fill,
                  {
                    width:
                      `${Math.min(
                        100,
                        competition.registeredCount /
                        competition.maxParticipants *
                        100
                      )}%`
                  }
                ]}
              />

            </View>


            <Text style={styles.booked}>

              {competition.registeredCount}
              {' / '}
              {competition.maxParticipants}
              {' '}Booked

            </Text>

          </View>

        </View>

      </Card>


      {/* JUDGE */}

      <Card>

        <View style={styles.judgeRow}>

          <View style={styles.avatar}>

            <Ionicons
              name="person"
              size={42}
              color={colors.teal}
            />

          </View>


          <View
            style={{
              flex: 1,
              marginLeft: 16
            }}
          >

            <Text style={styles.label}>
              Judge
            </Text>

            <Text style={styles.judgeName}>
              {competition.judge.name}
            </Text>

            <Text style={styles.judgeDetail}>
              {competition.judge.role}
            </Text>

            <Text style={styles.judgeDetail}>
              {competition.judge.experience}
            </Text>

          </View>


          <Pressable
            style={styles.play}
            onPress={openJudgeVideo}
          >

            <Ionicons
              name="play"
              size={23}
              color={colors.teal}
            />

          </Pressable>

        </View>


        <Text style={styles.video}>
          Intro Video
        </Text>

      </Card>


      {/* COUNTDOWN */}

      <View style={styles.countBar}>

        <Ionicons
          name="hourglass-outline"
          size={22}
          color={colors.teal}
        />

        <Text style={styles.countLabel}>
          Registration closes in
        </Text>

        <Countdown
          target={
            competition.registrationClosesAt
          }
          style={styles.countdown}
        />

        <Ionicons
          name="timer-outline"
          size={22}
          color={colors.teal}
        />

        <Text style={styles.hurry}>
          Hurry up!
        </Text>

      </View>


      {/* IMPORTANT DATES */}

      <Card>

        <SectionTitle>
          Important Dates
        </SectionTitle>


        <View style={styles.dates}>

          <DateBox
            icon="calendar-outline"
            title="Register Before"
            date={competition.dates.registerBefore}
            time={competition.dates.registerTime}
          />

          <DateBox
            icon="send-outline"
            title="Submission Starts"
            date={competition.dates.submissionStarts}
            time={competition.dates.submissionStartsTime}
          />

          <DateBox
            icon="cloud-upload-outline"
            title="Submission Ends"
            date={competition.dates.submissionEnds}
            time={competition.dates.submissionEndsTime}
          />

          <DateBox
            icon="trophy-outline"
            title="Result Date"
            date={competition.dates.resultDate}
            time={competition.dates.resultTime}
          />

        </View>

      </Card>


      {/* PREVIOUS WINNERS */}

      <Card>

        <SectionTitle>
          Previous Winners
        </SectionTitle>


        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{marginTop: 10}}
        >

          {competition.winners.map(
            (winner, index) => (

              <Pressable
                style={styles.winner}
                key={index}
                onPress={() =>
                  Alert.alert(
                    'Previous Winner',
                    `${winner.name}\n${winner.position}`
                  )
                }
              >

                <View style={styles.winnerImg}>

                  <Ionicons
                    name="person"
                    size={34}
                    color={colors.teal}
                  />


                  <View style={styles.miniPlay}>

                    <Ionicons
                      name="play"
                      size={10}
                      color="#fff"
                    />

                  </View>

                </View>


                <View>

                  <Text style={styles.winnerName}>
                    {winner.name}
                  </Text>

                  <Text style={styles.winnerPos}>
                    {winner.position}
                  </Text>

                </View>

              </Pressable>

            )
          )}

        </ScrollView>

      </Card>


      {/* TABS */}

      <Card>

        <View style={styles.tabs}>

          {[
            'About Competition',
            'Judging Parameters',
            'Rules & Eligibility'
          ].map(tabName => (

            <Pressable
              key={tabName}
              onPress={() => {
                setTab(tabName);
                setExpanded(false);
              }}
              style={[
                styles.tab,
                {
                  borderBottomWidth:
                    tab === tabName
                      ? 3
                      : 0
                }
              ]}
            >

              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      tab === tabName
                        ? colors.teal
                        : colors.muted
                  }
                ]}
              >
                {tabName}
              </Text>

            </Pressable>

          ))}

        </View>


        <Text
          style={styles.about}
          numberOfLines={
            expanded
              ? undefined
              : 4
          }
        >
          {currentTabContent}
        </Text>


        <Pressable
          onPress={() =>
            setExpanded(value => !value)
          }
        >

          <Text style={styles.more}>
            {expanded
              ? 'View less ↑'
              : 'View more ↓'}
          </Text>

        </Pressable>

      </Card>


      {/* REWARDS */}

      <Card>

        <View style={styles.rewardHeader}>

          <SectionTitle>
            Rewards
          </SectionTitle>

          <Text style={styles.all}>
            (All Positions)
          </Text>

        </View>


        {competition.rewards.map(
          (reward, index) => (

            <View
              key={index}
              style={styles.reward}
            >

              <Ionicons
                name={
                  index < 3
                    ? 'medal-outline'
                    : 'star-outline'
                }
                size={22}
                color={
                  index < 3
                    ? '#f2a100'
                    : colors.teal
                }
              />


              <Text style={styles.rewardName}>
                {reward.position}
              </Text>


              <Text style={styles.rewardAmount}>
                ₹ {reward.amount}
              </Text>

            </View>

          )
        )}

      </Card>


      {/* DISCLAIMER */}

      <View style={styles.disclaimer}>

        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.teal}
        />

        <Text style={styles.disclaimerText}>
          Only contributions from paid participants
          will be considered for judging.
        </Text>

      </View>


      {/* PAYMENT INFO */}

      <Pressable
        onPress={showPaymentInfo}
      >

        <Card>

          <View style={styles.infoRow}>

            <View style={styles.videoBox}>

              <Ionicons
                name="play"
                size={19}
                color={colors.teal}
              />

            </View>


            <View
              style={{
                flex: 1,
                marginLeft: 10
              }}
            >

              <Text style={styles.infoTitle}>
                How will you receive prize money?
              </Text>

              <Text style={styles.infoSub}>
                Watch video to know more
              </Text>

            </View>


            <View style={{flex: 1}}>

              <Text style={styles.infoSub}>
                Refund policy
              </Text>

              <Text style={styles.infoSub}>
                Secure payments powered by Razorpay
              </Text>

            </View>

          </View>

        </Card>

      </Pressable>


      {/* REFERRAL */}

      <View style={styles.referral}>

        <Ionicons
          name="megaphone-outline"
          size={35}
          color="#49bf9e"
        />


        <View
          style={{
            flex: 1,
            marginLeft: 13
          }}
        >

          <Text style={styles.refTitle}>
            Refer & Earn more discount
          </Text>


          <View style={styles.refLink}>

            <Text
              numberOfLines={1}
              style={styles.url}
            >
              https://feedants.com/r/referral123
            </Text>

            <Pressable
              onPress={copyReferralLink}
            >

              <Text style={styles.copy}>
                Copy Link
              </Text>

            </Pressable>

          </View>


          <Text style={styles.earn}>
            You earn ₹10 for every signup
          </Text>

        </View>


        <Pressable
          style={styles.referBtn}
          onPress={shareReferralLink}
        >

          <Text style={styles.referText}>
            Refer Now
          </Text>

        </Pressable>

      </View>


      {/* USERS */}

      <Pressable
        style={styles.users}
        onPress={showReviews}
      >

        <Ionicons
          name="chatbubble-ellipses-outline"
          size={23}
          color={colors.navy}
        />


        <View
          style={{
            flex: 1,
            marginLeft: 10
          }}
        >

          <Text style={styles.usersTitle}>
            Hear From Our Users
          </Text>

          <Text style={styles.infoSub}>
            See what participants say about Feedants
          </Text>

        </View>


        <Ionicons
          name="chevron-forward"
          size={21}
          color={colors.navy}
        />

      </Pressable>


      {/* AD */}

      <View style={styles.ad}>

        <Ionicons
          name="megaphone-outline"
          size={22}
          color="#6e79a1"
        />

        <Text style={styles.adText}>
          Ad Here
        </Text>

      </View>


      {/* MAIN ACTION BUTTON */}

      <Pressable
        disabled={
          busy ||
          !buttonEnabled ||
          hasSubmission
        }

        onPress={
          competition.isRegistered
            ? uploadSubmission
            : register
        }

        style={[
          styles.submit,
          {
            opacity:
              busy ||
              !buttonEnabled ||
              hasSubmission
                ? 0.65
                : 1
          }
        ]}
      >

        {busy ? (

          <ActivityIndicator
            color="#fff"
          />

        ) : (

          <>

            <Text style={styles.submitText}>

              {hasSubmission
                ? 'Submission Uploaded'
                : competition.isRegistered
                ? submissionOpen
                  ? 'Upload Submission'
                  : 'Submission Closed'
                : canRegister
                ? 'Register Now'
                : competition.isFull
                ? 'Competition Full'
                : 'Registration Closed'}

            </Text>


            <Text style={styles.submitSub}>

              {hasSubmission
                ? 'Your entry has been submitted'
                : competition.isRegistered &&
                  submissionOpen
                ? 'Upload your entry'
                : !competition.isRegistered &&
                  canRegister
                ? `Pay ₹${competition.entryFee}`
                : ''}

            </Text>

          </>

        )}

      </Pressable>


      {/* BOTTOM NAVIGATION */}

      <View style={styles.nav}>

        <Pressable
          onPress={() =>
            Alert.alert(
              'Home',
              'Home navigation is not available in this assignment screen.'
            )
          }
        >

          <Ionicons
            name="home-outline"
            size={24}
            color="#7d87a7"
          />

          <Text style={styles.navText}>
            Home
          </Text>

        </Pressable>


        <Pressable
          onPress={() =>
            Alert.alert(
              'Explore',
              'Explore navigation is not available in this assignment screen.'
            )
          }
        >

          <Ionicons
            name="search-outline"
            size={24}
            color="#7d87a7"
          />

          <Text style={styles.navText}>
            Explore
          </Text>

        </Pressable>


        <Pressable
          style={styles.plus}
          onPress={() =>
            Alert.alert(
              'Create',
              'Competition creation is outside this competition-details assignment.'
            )
          }
        >

          <Ionicons
            name="add"
            size={31}
            color="#fff"
          />

        </Pressable>


        <Pressable
          onPress={() =>
            Alert.alert(
              'Competitions',
              'You are currently viewing a competition.'
            )
          }
        >

          <Ionicons
            name="trophy-outline"
            size={24}
            color={colors.teal}
          />

          <Text
            style={[
              styles.navText,
              {
                color: colors.teal
              }
            ]}
          >
            Competitions
          </Text>

        </Pressable>


        <Pressable
          onPress={() =>
            Alert.alert(
              'Profile',
              'Profile navigation is not available in this assignment screen.'
            )
          }
        >

          <Ionicons
            name="person-circle-outline"
            size={24}
            color="#7d87a7"
          />

          <Text style={styles.navText}>
            Profile
          </Text>

        </Pressable>

      </View>

    </ScrollView>
  );
}


/* ================================= */
/* STYLES */
/* ================================= */

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: colors.bg
  },

  container: {
    padding: 16,
    paddingBottom: 25
  },

  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg
  },

  loadingText: {
    marginTop: 10,
    color: colors.muted
  },


  /* HEADER */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13
  },

  back: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  backText: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.navy,
    marginLeft: 8
  },

  lang: {
    flexDirection: 'row',
    backgroundColor: '#f0f2f7',
    borderRadius: 20,
    overflow: 'hidden'
  },

  activeLang: {
    backgroundColor: colors.teal,
    paddingHorizontal: 16,
    paddingVertical: 8
  },

  hindi: {
    color: colors.navy,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 8
  },


  /* COMPETITION */

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.navy,
    flex: 1
  },

  registered: {
    backgroundColor: '#eef9f9',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center'
  },

  registeredText: {
    color: colors.teal,
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 4
  },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },

  pill: {
    backgroundColor: '#f3f5fa',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 7
  },

  pillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#263452'
  },

  certificate: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 7
  },

  certText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.teal,
    marginLeft: 5
  },


  /* STATS */

  stats: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 19
  },

  label: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '700'
  },

  money: {
    fontSize: 27,
    fontWeight: '900',
    color: colors.teal,
    marginTop: 2
  },

  spots: {
    fontSize: 12,
    color: colors.teal,
    fontWeight: '800'
  },

  progress: {
    height: 5,
    backgroundColor: '#d8eff0',
    borderRadius: 5,
    marginTop: 8,
    overflow: 'hidden'
  },

  fill: {
    height: '100%',
    backgroundColor: colors.teal
  },

  booked: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 5
  },


  /* JUDGE */

  judgeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#eef4f5',
    alignItems: 'center',
    justifyContent: 'center'
  },

  judgeName: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.navy,
    marginVertical: 3
  },

  judgeDetail: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3
  },

  play: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#e9f8fa',
    alignItems: 'center',
    justifyContent: 'center'
  },

  video: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: colors.muted,
    marginTop: -4
  },


  /* COUNTDOWN */

  countBar: {
    backgroundColor: '#edf9fa',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },

  countLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.navy,
    marginLeft: 7
  },

  countdown: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.teal,
    marginHorizontal: 9
  },

  hurry: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.teal,
    marginLeft: 4
  },


  /* DATES */

  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.navy
  },

  dates: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    marginTop: 9,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden'
  },

  dateBox: {
    width: '50%',
    padding: 13,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border
  },

  dateLabel: {
    fontSize: 10,
    color: colors.muted
  },

  dateValue: {
    fontSize: 13,
    color: colors.teal,
    fontWeight: '900',
    marginTop: 2
  },

  time: {
    fontSize: 11,
    color: colors.navy,
    fontWeight: '700'
  },


  /* WINNERS */

  winner: {
    width: 170,
    backgroundColor: '#f6f8fc',
    borderRadius: 11,
    padding: 7,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },

  winnerImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#dfeff1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },

  miniPlay: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center'
  },

  winnerName: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.navy,
    marginLeft: 7
  },

  winnerPos: {
    fontSize: 10,
    color: colors.teal,
    marginLeft: 7,
    marginTop: 2
  },


  /* TABS */

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.border
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 9
  },

  tabText: {
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center'
  },

  about: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 21,
    marginTop: 12
  },

  more: {
    color: colors.teal,
    fontWeight: '900',
    alignSelf: 'center',
    marginTop: 7
  },


  /* REWARDS */

  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  all: {
    color: colors.muted,
    fontSize: 11,
    marginLeft: 7
  },

  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderColor: '#eef0f5'
  },

  rewardName: {
    flex: 1,
    fontWeight: '800',
    color: '#263452',
    marginLeft: 9
  },

  rewardAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.teal
  },


  /* DISCLAIMER */

  disclaimer: {
    backgroundColor: '#edf9fa',
    borderRadius: 10,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },

  disclaimerText: {
    flex: 1,
    fontSize: 10,
    color: '#263452',
    marginLeft: 7
  },


  /* PAYMENT */

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  videoBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#dff7ee',
    alignItems: 'center',
    justifyContent: 'center'
  },

  infoTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.navy
  },

  infoSub: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 4
  },


  /* REFERRAL */

  referral: {
    backgroundColor: colors.mint,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },

  refTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.navy
  },

  refLink: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d9e6e6',
    borderRadius: 7,
    padding: 7,
    flexDirection: 'row'
  },

  url: {
    flex: 1,
    fontSize: 9,
    color: '#52618a'
  },

  copy: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.teal
  },

  earn: {
    fontSize: 9,
    color: colors.teal,
    fontWeight: '800',
    marginTop: 4
  },

  referBtn: {
    backgroundColor: colors.teal,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 9
  },

  referText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 10
  },


  /* USERS */

  users: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 9
  },

  usersTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.navy
  },


  /* AD */

  ad: {
    height: 43,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cfd5e4',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 9
  },

  adText: {
    color: '#6e79a1',
    fontWeight: '800',
    fontSize: 11,
    marginLeft: 6
  },


  /* SUBMIT BUTTON */

  submit: {
    backgroundColor: colors.teal,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10
  },

  submitText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15
  },

  submitSub: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2
  },


  /* BOTTOM NAV */

  nav: {
    height: 67,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },

  navText: {
    fontSize: 8,
    color: '#7d87a7',
    textAlign: 'center',
    marginTop: 3
  },

  plus: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22
  }

});