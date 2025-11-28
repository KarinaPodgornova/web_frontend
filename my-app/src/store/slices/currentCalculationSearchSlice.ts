import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CurrentCalculationSearchState {
  searchName: string;
  searchHistory: string[];
}

const initialState: CurrentCalculationSearchState = {
  searchName: '',
  searchHistory: []
};

const currentCalculationSearchSlice = createSlice({
  name: 'currentCalculationSearch',
  initialState,
  reducers: {
    setSearchName: (state, action: PayloadAction<string>) => {
      state.searchName = action.payload;
    },
    addToHistory: (state, action: PayloadAction<string>) => {
      if (action.payload && !state.searchHistory.includes(action.payload)) {
        state.searchHistory.push(action.payload);
      }
    },
    clearSearch: (state) => {
      state.searchName = '';
    }
  }
});

export const { setSearchName, addToHistory, clearSearch } = currentCalculationSearchSlice.actions;
export default currentCalculationSearchSlice.reducer;
