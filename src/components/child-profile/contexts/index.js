export { ChildProfileBaseProvider, useChildProfileBase } from './ChildProfileBaseContext';
export { DrawingsProvider, useDrawings } from './DrawingsContext';
export { EmotionalStatusProvider, useEmotionalStatusContext } from './EmotionalStatusContext';
export { RecommendationsProvider, useRecommendationsContext } from './RecommendationsContext';
export { PsychologicalHistoryProvider, usePsychologicalHistoryContext } from './PsychologicalHistoryContext';

// Export composer and selective providers
export {
  ChildProfileComposer,
  createSelectiveProvider,
  DrawingManagementProvider,
  PsychologicalAnalysisProvider,
  RecommendationsManagementProvider
} from './ChildProfileComposer';