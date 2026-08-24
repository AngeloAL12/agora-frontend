export type ReportType = 'report' | 'suggestion';

export interface SegmentedOption {
  label: string;
  value: string;
}

export type LocalImageFile = {
  uri: string;
  type: string;
  name: string;
};
