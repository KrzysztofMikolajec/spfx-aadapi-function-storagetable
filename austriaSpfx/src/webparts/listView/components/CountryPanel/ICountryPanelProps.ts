import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface ICountryPanelProps {
  countries?: any[];
  context?: WebPartContext;
}

export interface ICountryPanelState {
  loading?: boolean;
  buttonsDisabled: boolean;
  hideDialog: boolean;
  dialogTitle?: string;
  newItem?: {
    Name: string;
    RowKey: string;
  }
  action?: string;
  countries?: any[];
}