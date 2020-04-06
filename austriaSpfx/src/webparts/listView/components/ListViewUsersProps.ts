import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IListViewUsersProps {
  description: string;
  context: WebPartContext;
}

export interface IListViewUsersState {
  users?: any[];
  loading?: boolean;
  buttonsDisabled: boolean;
  hideDialog: boolean;
  dialogTitle?: string;
  newItem?: {
    FirstName: string;
    LastName: string;
    Country: string;
    RowKey: string;
    LocationId?: string;
  }
  action?: string;
  countries?: any[];
  countriesDropdown?: any[];
  showCountryPanel?:boolean;
  _goBack?:VoidFunction;
}
