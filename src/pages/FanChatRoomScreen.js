import React from 'react'
import Orientation from 'react-native-orientation'
import { SafeAreaView, StyleSheet, Image, ImageBackground, TouchableOpacity, View, Platform, ScrollView, FlatList, Text } from 'react-native'
import { Header, Input, Button, Avatar } from 'react-native-elements'
import PropTypes from 'prop-types';
import { AppContext, RoomHeader } from '../components';
import { OTPublisher, OTSession, OTSubscriber, OT } from 'opentok-react-native'
import firebase from 'react-native-firebase';
import { OPENTOK, ToS_URL } from '../utils/Constants'
import { cStyles, screenWidth, screenHeight } from './styles';

import OTPublisherStream from './OTPublisherStream';
import OTSubscriberStream from './OTSubscriberStream';

const auth = firebase.auth()
const firestore = firebase.firestore()

const IMAGE_BAR = require('app/assets/images/chatview_bar.png');
const IMAGE_GRAD1 = require('app/assets/images/chatview_grad1.png');
const IMAGE_GRAD2 = require('app/assets/images/chatview_grad2.png');

const IMAGE_SAMPLE1 = require('app/assets/images/chatlive_sample1.png');
const IMAGE_SAMPLE2 = require('app/assets/images/chatlive_sample2.png');

const ICON_PHOTO = require('app/assets/images/ic_photo.png');
const ICON_CALL = require('app/assets/images/ic_call.png');
const ICON_AUDIO = require('app/assets/images/ic_audio.png');
const ICON_VIDEO = require('app/assets/images/ic_video.png');
const ICON_MESSAGE = require('app/assets/images/ic_message.png');

const COLOR_GOLD = '#F8D099'


export default class FanChatRoomScreen extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isFullScreen: false,
      sid: '',
      publishAudio: true,
      publishVideo: true,
      isFrontCamera: true
    }
    this.sessionEventHandlers = {
      connectionCreated: event =>  { 
        console.warn("connection created", event);
      },
      connectionDestroyed: event =>  { 
        console.warn("connection destroyed", event);
      },
      sessionConnected: event => { 
        console.warn("Client connect to a session")
      },
      sessionDisconnected: event => {
        console.warn("Client disConnect to a session")
        this.context.showLoading();
        firestore.collection('sessions').where('publisherId', '==', this.state.starId).get()
        .then(session => {
          this.context.hideLoading();
          if (session.docs.length > 0) {
            firestore.doc(`sessions/${this.state.sid}`).set({
              isChatting: false
            }, {merge: true})
          }
        })
        .catch(() => {
          this.context.hideLoading();
        })
      },
      sessionReconnected: event => {
        console.warn("session reconnected")
      },
    };
    this.publisherEventHandlers = {
      streamCreated: event => {
        console.log('Publisher stream created!', event);
        this.context.hideLoading();
      },
      streamDestroyed: event => {
        console.log('Publisher stream destroyed!', event);
      }
    };
  }

  componentDidMount() {
    Orientation.lockToPortrait();
    const sid = this.props.navigation.getParam('sid', '')
    const token = this.props.navigation.getParam('token', '')
    const starId = this.props.navigation.getParam('starId', '')
    const apiKey = this.props.navigation.getParam('apiKey', '')
    const sessionId = this.props.navigation.getParam('sessionId', '')
    firestore.doc(`sessions/${sid}`).set({
      isChatting: true
    }, {merge: true})
    this.setState({
      sid: sid,
      token, token,
      starId: starId,
      apiKey: apiKey,
      sessionId: sessionId,
    })
  }

  gotoReview() {
    this.props.navigation.navigate('review', {
      starId: this.state.starId
    })
  }

  onChangeCamera() {
    console.warn(this.state.isFrontCamera)
    this.setState({
      isFrontCamera: !this.state.isFrontCamera
    })
  }
  onChangeAudio() {
    console.warn(this.state.publishAudio)
    this.setState({
      publishAudio: !this.state.publishAudio
    })
  }
  onChangeVideo() {
    console.warn(this.state.publishVideo)
    this.setState({
      publishVideo: !this.state.publishVideo
    })
  }

  render() {
    return(
      <View style={styles.container}>
        {this.state.apiKey && this.state.token && this.state.sessionId &&
        <OTSession
          apiKey={this.state.apiKey? this.state.apiKey:null}
          sessionId={this.state.sessionId? this.state.sessionId:null}
          token={this.state.token? this.state.token: null} 
          eventHandlers={this.sessionEventHandlers}
         >
          <OTSubscriber style={{width: '100%', height:this.state.isFullScreen?screenHeight:screenHeight*0.65, position: 'absolute'}} />
          {!this.state.isFullScreen &&
            <View style={styles.container}>
              <View style={styles.view_star}>
                <Image
                  style={{width: '100%', height: '50%', position: 'absolute'}}
                  source={IMAGE_GRAD1}
                  resizeMode='cover'
                />
            </View>
              <Image
                style={styles.view_bar}
                source={IMAGE_BAR}
                resizeMode='cover'
              />
              <View style={styles.view_fan}>
                <OTPublisher 
                  style={styles.view_absolute} 
                  eventHandlers={this.publisherEventHandlers}  
                  properties={{publishAudio: this.state.publishAudio, publishVideo: this.state.publishVideo, cameraPosition: this.state.isFrontCamera?'front':'back'}}/>
                <Image
                  style={{width: '100%', height: '80%', position: 'absolute'}}
                  source={IMAGE_GRAD2}
                  resizeMode='stretch'
                />
                <TouchableOpacity style={{marginBottom: 20}}  onPress={()=>this.gotoReview()} >
                  <Image
                    style={styles.image_button}
                    source={ICON_CALL}
                    resizeMode='stretch'
                  />
                </TouchableOpacity>
                
                <View style={styles.view_control}>
                  <TouchableOpacity onPress={()=>this.onChangeVideo()}>
                    <Image
                      style={styles.image_button}
                      source={ICON_VIDEO}
                      resizeMode='stretch'
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>this.onChangeAudio()}>
                    <Image
                      style={styles.image_button}
                      source={ICON_AUDIO}
                      resizeMode='stretch'
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Image
                      style={styles.image_button}
                      source={ICON_MESSAGE}
                      resizeMode='stretch'
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Image
                      style={styles.image_button}
                      source={ICON_PHOTO}
                      resizeMode='stretch'
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
          
          {this.state.isFullScreen &&
            <View style={styles.view_full}>
              <TouchableOpacity style={{marginBottom: 30}} onPress={()=>this.gotoReview()}>
                <Image
                  style={styles.image_button}
                  source={ICON_CALL}
                  resizeMode='stretch'
                />
              </TouchableOpacity>
              <View style={{width:'100%', height: 150, position: 'absolute', paddingRight: 25, paddingBottom: 50,justifyContent: 'flex-end', alignItems: 'flex-end'}}>
                <TouchableOpacity onPress={()=>this.setState({isFullScreen: false})} style={{width: 100, height: 100, borderColor: COLOR_GOLD, borderWidth: 2, borderRadius:10, overflow: 'hidden'}}> 
                  <OTPublisher 
                    style={styles.view_absolute}
                    eventHandlers={this.publisherEventHandlers}  
                    />
                </TouchableOpacity>
              </View>
            </View>
          }

        <RoomHeader
          eTime='03 m 1 s'
          // eTimeTag='elapsed time'
          showCast = {this.state.isFullScreen? false:true}
          showRight = {this.state.isFullScreen? false:true}
          showLeft = {this.state.isFullScreen? false:true}
          onPressCast = {()=>console.warn('cast')}
          onPressRight={()=>this.onChangeCamera()}
        />
        </OTSession>
        }
      </View>
    )
  }  
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  view_star: {
    width: '100%', 
    height: screenHeight*0.65
  },
  view_fan: {
    flex:1, 
    width: '100%', 
    alignItems: 'center',
    justifyContent: 'flex-end', 
  },
  view_bar: {
    width: '100%',
    height: 14
  },
  view_absolute: {
    width: '100%', 
    height: '100%', 
    position: 'absolute'
  },
  view_full: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  view_control: {
    width: '100%',
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  image_button: {
    width: 46,
    height: 46, 
    marginHorizontal: 15
  }
})

FanChatRoomScreen.contextType = AppContext;

FanChatRoomScreen.propTypes = {
  navigation: PropTypes.object
};