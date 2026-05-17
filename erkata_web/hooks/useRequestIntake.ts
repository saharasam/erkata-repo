import { useReducer, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import { useModal } from '../contexts/ModalContext';

export type RequestIntent = 'buy' | 'sell' | null;
export type RequestCategory = 'Home' | 'Furniture' | null;

export interface IntakeState {
  step: number;
  intent: RequestIntent;
  category: RequestCategory;
  metadata: Record<string, any>;
  area: string;
  woreda: string;
  budget: string;
  additionalDetails: string;
  isSubmitting: boolean;
  isAutoSubmitting: boolean;
  autoSubmit: boolean;
}

export type IntakeAction =
  | { type: 'SET_INTENT'; payload: RequestIntent }
  | { type: 'SET_CATEGORY'; payload: RequestCategory }
  | { type: 'UPDATE_METADATA'; payload: { key: string; value: any } }
  | { type: 'SET_LOCATION'; payload: { area?: string; woreda?: string } }
  | { type: 'SET_BUDGET'; payload: string }
  | { type: 'SET_ADDITIONAL_DETAILS'; payload: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_AUTO_SUBMITTING'; payload: boolean }
  | { type: 'RESET' };

export const STORAGE_KEY = 'erkata_pending_request';

// Steps definition for Home
export const homeSteps = [
  { id: 'intent', title: 'Intent' }, // step 0
  { id: 'category', title: 'Category' }, // step 1
  { id: 'construction', title: 'Status' }, // step 2
  { id: 'bedrooms', title: 'Bedrooms' }, // step 3
  { id: 'loan', title: 'Financial' }, // step 4
  { id: 'area', title: 'Location' }, // step 5
  { id: 'budget', title: 'Budget' }, // step 6
  { id: 'additional', title: 'Details' } // step 7
];

// Steps definition for Furniture
export const furnitureSteps = [
  { id: 'intent', title: 'Intent' }, // step 0
  { id: 'category', title: 'Category' }, // step 1
  { id: 'customization', title: 'Custom' }, // step 2
  { id: 'room', title: 'Room' }, // step 3
  { id: 'payment', title: 'Payment' }, // step 4
  { id: 'delivery', title: 'Delivery' }, // step 5
  { id: 'budget', title: 'Budget' }, // step 6
  { id: 'additional', title: 'Details' } // step 7
];

export const sanitizeSavedDraft = (rawDraft: string | null): Partial<IntakeState> => {
  if (!rawDraft) return {};
  try {
    const parsed = JSON.parse(rawDraft);
    if (!parsed || typeof parsed !== 'object') return {};

    const sanitized: Partial<IntakeState> = {};

    if (['buy', 'sell'].includes(parsed.intent)) {
      sanitized.intent = parsed.intent;
    }
    if (['Home', 'Furniture'].includes(parsed.category)) {
      sanitized.category = parsed.category;
    }
    if (parsed.metadata && typeof parsed.metadata === 'object') {
      sanitized.metadata = parsed.metadata;
    }
    if (typeof parsed.area === 'string') {
      sanitized.area = parsed.area;
    }
    if (typeof parsed.woreda === 'string') {
      sanitized.woreda = parsed.woreda;
    }
    if (parsed.budget !== undefined && parsed.budget !== null) {
      sanitized.budget = String(parsed.budget);
    }
    const details = parsed.description ?? parsed.additionalDetails;
    if (typeof details === 'string') {
      sanitized.additionalDetails = details;
    }
    if (Boolean(parsed.autoSubmit)) {
      sanitized.autoSubmit = true;
    }

    return sanitized;
  } catch (e) {
    console.error('[RequestIntake] Failed to parse saved draft:', e);
    return {};
  }
};

export const initIntakeState = (): IntakeState => {
  const defaultState: IntakeState = {
    step: 0,
    intent: null,
    category: null,
    metadata: {},
    area: 'Bole',
    woreda: '',
    budget: '',
    additionalDetails: '',
    isSubmitting: false,
    isAutoSubmitting: false,
    autoSubmit: false,
  };

  if (typeof window === 'undefined') return defaultState;

  const rawDraft = localStorage.getItem(STORAGE_KEY);
  const draft = sanitizeSavedDraft(rawDraft);

  if (Object.keys(draft).length === 0) return defaultState;

  let initialStep = 0;
  if (draft.category) {
    initialStep = 2; // Start at questions
  } else if (draft.intent) {
    initialStep = 1; // Start at category selection
  }

  // Consume and clear autoSubmit flag immediately during state initialization
  // to avoid strict-mode double submission bugs.
  if (draft.autoSubmit) {
    try {
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, autoSubmit: false }));
      }
    } catch (e) {
      console.error('[RequestIntake] Failed to clear autoSubmit flag from storage:', e);
    }
  }

  return {
    ...defaultState,
    ...draft,
    step: initialStep,
  };
};

export const intakeReducer = (state: IntakeState, action: IntakeAction): IntakeState => {
  switch (action.type) {
    case 'SET_INTENT':
      return {
        ...state,
        intent: action.payload,
        step: 1, // Advance to category selection
      };
    case 'SET_CATEGORY':
      return {
        ...state,
        category: action.payload,
        step: 2, // Advance to first question
      };
    case 'UPDATE_METADATA': {
      const newMetadata = { ...state.metadata, [action.payload.key]: action.payload.value };
      const currentSteps = state.category === 'Furniture' ? furnitureSteps : homeSteps;
      const nextStep = state.step < currentSteps.length - 1 ? state.step + 1 : state.step;
      return {
        ...state,
        metadata: newMetadata,
        step: nextStep,
      };
    }
    case 'SET_LOCATION':
      return {
        ...state,
        area: action.payload.area !== undefined ? action.payload.area : state.area,
        woreda: action.payload.woreda !== undefined ? action.payload.woreda : state.woreda,
      };
    case 'SET_BUDGET':
      return {
        ...state,
        budget: action.payload,
      };
    case 'SET_ADDITIONAL_DETAILS':
      return {
        ...state,
        additionalDetails: action.payload,
      };
    case 'NEXT_STEP': {
      const currentSteps = state.category === 'Furniture' ? furnitureSteps : homeSteps;
      if (state.step < currentSteps.length - 1) {
        return { ...state, step: state.step + 1 };
      }
      return state;
    }
    case 'PREV_STEP':
      return {
        ...state,
        step: state.step > 0 ? state.step - 1 : 0,
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };
    case 'SET_AUTO_SUBMITTING':
      return {
        ...state,
        isAutoSubmitting: action.payload,
      };
    case 'RESET':
      return {
        step: 0,
        intent: null,
        category: null,
        metadata: {},
        area: 'Bole',
        woreda: '',
        budget: '',
        additionalDetails: '',
        isSubmitting: false,
        isAutoSubmitting: false,
        autoSubmit: false,
      };
    default:
      return state;
  }
};

export const useRequestIntake = (isAuthenticated: boolean, onSuccess?: () => void) => {
  const [state, dispatch] = useReducer(intakeReducer, undefined, initIntakeState);
  const { showAlert } = useModal();
  const submissionLock = useRef(false);

  const currentSteps = state.category === 'Furniture' ? furnitureSteps : homeSteps;
  const isLastStep = state.step === currentSteps.length - 1;

  // Persist draft to localStorage on state changes (when user has progressed past initial view)
  useEffect(() => {
    if (state.intent || state.category) {
      const draftData = {
        intent: state.intent,
        category: state.category,
        metadata: state.metadata,
        area: state.area,
        woreda: state.woreda,
        budget: state.budget,
        description: state.additionalDetails,
        autoSubmit: state.autoSubmit,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
    }
  }, [state.intent, state.category, state.metadata, state.area, state.woreda, state.budget, state.additionalDetails, state.autoSubmit]);

  const performSubmission = useCallback(async (currentState: IntakeState, successCallback?: () => void) => {
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    const finalTitle = currentState.category === 'Home'
      ? `${currentState.metadata.bedrooms || ''} Bedroom ${currentState.category} in ${currentState.area}`
      : `Furniture for ${currentState.metadata.targetRoom || 'Room'}`;

    try {
      await api.post('/requests', {
        category: currentState.category,
        type: currentState.category === 'Home' ? 'real_estate' : 'furniture',
        details: {
          title: finalTitle,
          description: currentState.additionalDetails,
          budget: parseFloat(currentState.budget) || undefined,
        },
        metadata: currentState.metadata,
        locationZone: {
          kifleKetema: currentState.area,
          woreda: currentState.woreda
        }
      });

      localStorage.removeItem(STORAGE_KEY);
      dispatch({ type: 'RESET' });
      if (successCallback) successCallback();
    } catch (error: any) {
      console.error('[RequestIntake] Error submitting request:', error);
      submissionLock.current = false;
      showAlert({
        title: 'Submission Failed',
        message: error.response?.data?.message || 'There was an error. Please try again.',
        type: 'error'
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [showAlert]);

  // Auto-submit effect when isAuthenticated is true and autoSubmit was pending
  useEffect(() => {
    if (state.autoSubmit && isAuthenticated && !submissionLock.current) {
      console.log('[RequestIntake] Auto-submitting draft...');
      submissionLock.current = true;
      dispatch({ type: 'SET_AUTO_SUBMITTING', payload: true });

      performSubmission(state, onSuccess)
        .finally(() => {
          dispatch({ type: 'SET_AUTO_SUBMITTING', payload: false });
        });
    }
  }, [state, isAuthenticated, onSuccess, performSubmission]);

  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated) {
      const finalTitle = state.category === 'Home'
        ? `${state.metadata.bedrooms || ''} Bedroom ${state.category} in ${state.area}`
        : `Furniture for ${state.metadata.targetRoom || 'Room'}`;

      const draftData = {
        category: state.category,
        intent: state.intent,
        area: state.area,
        woreda: state.woreda,
        budget: state.budget,
        metadata: state.metadata,
        description: state.additionalDetails,
        title: finalTitle,
        autoSubmit: true,
        timestamp: new Date().getTime()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
      showAlert({
        title: 'Save your progress',
        message: 'You need to be logged in to submit. Redirecting to register...',
        type: 'info'
      });
      setTimeout(() => { window.location.href = '/#/register?fromRequest=true'; }, 500);
      return;
    }

    if (submissionLock.current) return;
    submissionLock.current = true;
    await performSubmission(state, onSuccess);
  }, [state, isAuthenticated, onSuccess, performSubmission, showAlert]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleSubmit();
    } else {
      dispatch({ type: 'NEXT_STEP' });
    }
  }, [isLastStep, handleSubmit]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  return {
    state,
    dispatch,
    currentSteps,
    isLastStep,
    setIntent: (intent: RequestIntent) => dispatch({ type: 'SET_INTENT', payload: intent }),
    setCategory: (category: RequestCategory) => dispatch({ type: 'SET_CATEGORY', payload: category }),
    updateMetadata: (key: string, value: any) => dispatch({ type: 'UPDATE_METADATA', payload: { key, value } }),
    setArea: (area: string) => dispatch({ type: 'SET_LOCATION', payload: { area } }),
    setWoreda: (woreda: string) => dispatch({ type: 'SET_LOCATION', payload: { woreda } }),
    setBudget: (budget: string) => dispatch({ type: 'SET_BUDGET', payload: budget }),
    setAdditionalDetails: (details: string) => dispatch({ type: 'SET_ADDITIONAL_DETAILS', payload: details }),
    handleNext,
    handleBack,
    handleSubmit,
  };
};
