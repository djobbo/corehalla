import firebase from 'firebase';
import 'firebase/functions';

firebase.initializeApp({
	apiKey: 'AIzaSyATm_gyIZ9bD3giXUajJpcj4u57oIl0q0g',
	authDomain: 'corehalla-neue.firebaseapp.com',
	databaseURL: 'https://corehalla-neue.firebaseio.com',
	projectId: 'corehalla-neue',
	storageBucket: 'corehalla-neue.appspot.com',
	messagingSenderId: '489247406380',
	appId: '1:489247406380:web:0c5a27391c1154aa475489',
	measurementId: 'G-GRV4GCF2KY',
});

export const functions = firebase.functions;
