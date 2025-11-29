import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSongs: [],
  currentIndex: 0,
  isActive: false,
  isPlaying: false,
  activeSong: {},
  fullScreen: false,
  autoAdd: false,
  partyId: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPartyId: (state, action) => {
      state.partyId = action.payload;
    },
    setActiveSong: (state, action) => {
      if(action.payload.song){
      state.activeSong = action.payload.song;
      }

      if(action.payload.data){
      state.currentSongs = action.payload.data;
      }

      if(action.payload.i){
      state.currentIndex = action.payload.i;
      }
      state.isActive = true;
    },

    nextSong: (state, action) => {

      if(state.currentSongs.length>0){
      state.activeSong = state.currentSongs[action.payload];
    
      state.currentIndex = action.payload;
      state.isActive = true;
      }
    },

    prevSong: (state, action) => {

      if(state.currentSongs.length>0){
      state.activeSong = state.currentSongs[action.payload];
      state.currentIndex = action.payload;
      state.isActive = true;
      }
    },

    playPause: (state, action) => {
      state.isPlaying = action.payload;
    },

    setFullScreen: (state, action) => {
      state.fullScreen = action.payload;
    },

    setAutoAdd: (state, action) => {
      state.autoAdd = action.payload;
    }
   
  },
});

export const { setActiveSong, nextSong, prevSong, playPause, setFullScreen, setAutoAdd, setPartyId } = playerSlice.actions;

export default playerSlice.reducer;
