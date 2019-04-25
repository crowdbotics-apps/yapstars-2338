import React from 'react';
import {
  View,
  Image,
  NativeModules,
  Text,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Linking
} from 'react-native';
import PropTypes from 'prop-types';
import { CheckBox } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import firebase from 'react-native-firebase';
// import InstagramLogin from 'react-native-instagram-login';
import { GoogleSignin } from 'react-native-google-signin';
import { AuthController } from 'app/services';
import { AppContext, Button } from 'app/components';
import { alert } from 'app/utils/Alert';
import { ToS_URL } from '../../constant';
import styles from './style';

const IMAGE_LOGO = require('app/assets/images/app_logo.png');
const IMAGE_BACKGROUND = require('app/assets/images/background.png');
const ICON_FB = require('app/assets/images/facebook.png');
const ICON_TW = require('app/assets/images/twitter.png');
const ICON_GL = require('app/assets/images/instagram.png');

const { RNTwitterSignIn } = NativeModules;
const { TwitterAuthProvider } = firebase.auth;

const TwitterKeys = {
  TWITTER_CONSUMER_KEY: 'D4l2twTmZr4031COwB8yJo9cE',
  TWITTER_CONSUMER_SECRET: 'KUqeSgJ9WIv4n4Ah6eC3E04n97goCUV1MEUl2g04DTOSrYEFXU'
};

GoogleSignin.configure();
class SingupScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      agreeTerms: false
    };
  }

  agreeTerms = () => {
    this.setState({
      agreeTerms: !this.state.agreeTerms
    });
  };

  goToLogin = () => {
    this.props.navigation.goBack();
  };

  goToForgotpswd = () => {
    this.props.navigation.navigate('forgotpassword');
  };

  facebookLogin = async () => {
    if (!this.state.agreeTerms) {
      alert('To register, you have to agree our Terms of Conditions.');
      return false;
    }

    try {
      const result = await LoginManager.logInWithReadPermissions([
        'public_profile',
        'email'
      ]);

      if (result.isCancelled) {
        // handle this however suites the flow of your app
        throw new Error('User cancelled request');
      }

      console.log(
        `Login success with permissions: ${result.grantedPermissions.toString()}`
      );

      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        // handle this however suites the flow of your app
        throw new Error(
          'Something went wrong obtaining the users access token'
        );
      }

      const credential = firebase.auth.FacebookAuthProvider.credential(
        data.accessToken
      );

      const firebaseUserCredential = await firebase
        .auth()
        .signInWithCredential(credential);

      console.log(JSON.stringify(firebaseUserCredential.user.toJSON()));

      this.props.navigation.navigate('main');
    } catch (e) {
      console.error(e);
    }
  };

  twitterLogin = () => {
    if (!this.state.agreeTerms) {
      alert('To register, you have to agree our Terms of Conditions.');
      return false;
    }

    RNTwitterSignIn.init(
      TwitterKeys.TWITTER_CONSUMER_KEY,
      TwitterKeys.TWITTER_CONSUMER_SECRET
    );

    RNTwitterSignIn.logIn()
      .then((loginData) => {
        const { authToken, authTokenSecret } = loginData;
        if (authToken && authTokenSecret) {
          this.setState({
            isLoggedIn: true
          });
          return TwitterAuthProvider.credential(authToken, authTokenSecret);
        }
      })
      .then((credential) => {
        console.log('firebase auth credential', credential);
        firebase.auth().signInWithCredential(credential);
        return this.props.navigation.navigate('main');
      })
      // .then((firebaseUserCredential) => {
      //   console.log(JSON.stringify(firebaseUserCredential.user.toJSON()));
      //   // this.props.navigation.navigate('main');
      // })
      .catch((error) => {
        console.log(error);
      });
  };

  async googleLogin() {
    if (!this.state.agreeTerms) {
      alert('To register, you have to agree our Terms of Conditions.');
      return false;
    }

    try {
      await GoogleSignin.configure({
        webClient:
          '509625931637-vbb90qgq43pvtdn1jdl3324e4ka4fegd.apps.googleusercontent.com',
        iosClientId:
          '509625931637-ubkfca4o7irg1ucv9e5r7dprj6uhf673.apps.googleusercontent.com'
      });

      const data = await GoogleSignin.signIn();

      const credential = firebase.auth.GoogleAuthProvider.credential(
        data.idToken,
        data.accessToken
      );

      const firebaseUserCredential = await firebase
        .auth()
        .signInWithCredential(credential);

      // console.warn(JSON.stringify(firebaseUserCredential.user.toJSON()));
      return this.props.navigation.navigate('main');
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    return (
      <ImageBackground source={IMAGE_BACKGROUND} style={styles.background}>
        <KeyboardAwareScrollView contentContainerStyle={styles.container}>
          <SafeAreaView style={styles.container}>
            <View style={styles.container}>
              <View style={styles.content}>
                <Image
                  source={IMAGE_LOGO}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.content}>
                <Text style={styles.desc}>
                  Sign Up with your social media acoount
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => this.facebookLogin()}
                    style={styles.button}
                  >
                    <Image
                      source={ICON_FB}
                      style={styles.btnImg}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.twitterLogin()}
                    style={styles.button}
                  >
                    <Image
                      source={ICON_TW}
                      style={styles.btnImg}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.googleLogin()}
                    style={styles.button}
                  >
                    <Image
                      source={ICON_GL}
                      style={styles.btnImg}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.tosContainer}>
                  <View style={styles.checkContainer}>
                    <CheckBox
                      containerStyle={styles.checkbox}
                      checked={this.state.agreeTerms}
                      onIconPress={this.agreeTerms}
                      size={20}
                    />
                    <Text style={styles.desc}>
                      By signing up, you agree to our
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => Linking.openURL(ToS_URL)}>
                    <Text style={styles.tosDesc}>ToS & Privacy policy</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.signupContainer}>
                  <TouchableOpacity onPress={() => this.goToLogin()}>
                    <Text style={styles.description}>
                      Already have an account?{' '}
                      <Text style={styles.signup}>Log In</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* <InstagramLogin
                ref={(ref) => (this.instagramLogin = ref)}
                clientId="5d40831591bc467d835d3bfa61884cf4"
                redirectUrl="http://bolthill.com"
                scopes={['public_content', 'follower_list']}
                onLoginSuccess={(token) => this.setState({ token })}
                onLoginFailure={(data) => console.log(data)}
              /> */}
            </View>
          </SafeAreaView>
        </KeyboardAwareScrollView>
      </ImageBackground>
    );
  }
}
SingupScreen.contextType = AppContext;

SingupScreen.propTypes = {
  navigation: PropTypes.object
};

export default SingupScreen;
