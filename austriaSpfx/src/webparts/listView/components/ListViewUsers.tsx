import * as React from 'react';
import styles from './ListView.module.scss';
import { IListViewUsersProps, IListViewUsersState } from './ListViewUsersProps';
import {
  autobind
} from 'office-ui-fabric-react';

import { ListView, IViewField, SelectionMode, GroupOrder, IGrouping } from "@pnp/spfx-controls-react/lib/ListView";
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/components/Spinner';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { ApiService } from '../services/ApiService'
import { Placeholder } from '@pnp/spfx-controls-react/lib/Placeholder';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ComboBox } from 'office-ui-fabric-react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import CountryPanel from './CountryPanel/CountryPanel'
import {ICountryPanelProps} from './CountryPanel/ICountryPanelProps'

export default class ListViewUsers extends React.Component<IListViewUsersProps, IListViewUsersState> {

  private apiSvc: ApiService = new ApiService(this.props.context)
  private _viewFields: IViewField[] = [
    {
      name: "FirstName",
      sorting: true,
      maxWidth: 100
    },
    {
      name: "LastName",
      sorting: true,
      maxWidth: 100
    },
    {
      name: "Country",
      sorting: true,
      maxWidth: 150
    },
    {
      name: "RowKey",
      displayName: "RowKey",
      maxWidth: 50,
      render: (item: any) => {
        return <span></span>;
      }
    }
  ]

  constructor(props: IListViewUsersProps) {
    super(props);

    this.state = {
      users: [],
      loading: false,
      buttonsDisabled: true,
      hideDialog: true,
      newItem: {
        FirstName: '',
        LastName: '',
        Country: '',
        RowKey: ''
      },
      countries: []
    };
  }
  public render(): React.ReactElement<IListViewUsersProps> {

    const groupByFields: IGrouping[] = [
      {
        name: "Country",
        order: GroupOrder.ascending
      }
    ];

    const _items: ICommandBarItemProps[] = [
      {
        key: 'New',
        text: 'New',
        iconProps: { iconName: 'Add' },
        onClick: () => {
          this.setState({
            hideDialog: false,
            dialogTitle: 'New user',
            action: "newUser"
          })
          console.log('New')
        },
      },
      {
        key: 'Edit',
        text: 'Edit',
        disabled: this.state.buttonsDisabled,
        iconProps: { iconName: 'Edit' },
        onClick: () => {
          this.setState({
            hideDialog: false,
            dialogTitle: 'Edit user',
            action: "editUser"
          })
          console.log('Edit')
        },
      },
      {
        key: 'Remove',
        text: 'Remove',
        disabled: this.state.buttonsDisabled,
        iconProps: { iconName: 'Cancel' },
        onClick: () => {
          this.setState({
            hideDialog: false,
            dialogTitle: 'Remove user',
            action: "removeUser"
          })
          console.log('Remove')
        },
      },
      {
        key: 'EditCountries',
        text: 'Edit Countries',
        disabled: false,
        iconProps: { iconName: 'World' },
        onClick: () => {
          this.setState( {showCountryPanel:true});
        },
      },
    ];

    const _farItems: ICommandBarItemProps[] = [
      {
        key: 'info',
        text: 'Select user and test CRUD',
        // This needs an ariaLabel since it's icon-only
        ariaLabel: 'Info',
        iconOnly: true,
        iconProps: { iconName: 'Info' },
        onClick: () => console.log('Info'),
      },
    ];

    return (
      <div>
        {
          this.state.loading ?
            (
              <Spinner size={SpinnerSize.large} label="Retrieving users ..." />
            ) : (
              this.state.users === undefined ?
                (
                  <div>
                    <Placeholder
                      iconName="InfoSolid"
                      iconText="No items found"
                      description="Table with users does not containt users." />
                    <p className={styles.listView}>
                      <PrimaryButton
                        text='Get mockup data'
                        title='Get mockup data'
                        onClick={this._getMockUpUsers}
                      />
                    </p>
                  </div>
                ) : (
                  <div>
                    <div>
                      <CommandBar
                        items={_items}
                        farItems={_farItems}
                        ariaLabel="Use left and right arrow keys to navigate between commands"
                      />
                    </div>
                    <div className={styles.listView}>
                      <ListView items={this.state.users}
                        viewFields={this._viewFields}
                        compact={false}
                        selectionMode={SelectionMode.single}
                        selection={this._getSelection}
                        showFilter={true}
                        groupByFields={groupByFields}
                      />
                    </div>
                    <Dialog
                      hidden={this.state.hideDialog}
                      onDismiss={this._closeDialog}
                      dialogContentProps={{
                        type: DialogType.normal,
                        title: this.state.dialogTitle
                      }}
                      modalProps={{
                        isBlocking: false
                      }}
                    >
                      <TextField
                        label="First Name:"
                        underlined
                        required
                        placeholder="Enter text here"
                        disabled={this.state.action === 'removeUser' ? true : false}
                        value={this.state.newItem.FirstName}
                        name='FirstName'
                        onKeyUp={this.handleInputChange}
                      />
                      <TextField
                        label="Last Name:"
                        underlined
                        required
                        placeholder="Enter text here"
                        disabled={this.state.action === 'removeUser' ? true : false}
                        value={this.state.newItem.LastName}
                        name='LastName'
                        onKeyUp={this.handleInputChange}
                      />
                      <ComboBox
                        label="Country:"
                        allowFreeform={true}
                        required
                        disabled={this.state.action === 'removeUser' ? true : false}
                        autoComplete='on'
                        options={this.state.countriesDropdown}
                        selectedKey={this.state.newItem.Country}
                        onChanged={this.handleCountrySelect}
                        onKeyUp={this.handleCountryChange}
                      />

                      <DialogFooter>
                        <PrimaryButton
                          onClick={this._saveChanges}
                          text="Confirm"
                          disabled={this.state.newItem.FirstName && this.state.newItem.LastName ? false : true}
                        />
                        <DefaultButton onClick={this._closeDialog} text='Cancel' />
                      </DialogFooter>
                    </Dialog>
                    <Panel isOpen={this.state.showCountryPanel} onDismiss={this._hidePanel} type={PanelType.large} headerText="Country list">
                      <CountryPanel
                        countries={this.state.countries}
                        context={this.props.context}
                      />
                    </Panel>
                  </div>
                )
            )
        }
      </div>
    );
  }

  private _hidePanel = () => {

       this.setState({ showCountryPanel: false });
       this._getCountries()
   
  }

  private _saveChanges = (): void => {
    //console.log('newItem', this.state.newItem)
    this.setState({
      loading: true,
      hideDialog: true,
      newItem: {
        ...this.state.newItem,
        LocationId: this.state.countries.filter((country) => { return (country.Name === this.state.newItem.Country); })[0].RowKey
      }
    }, () => {
      switch (this.state.action) {
        case 'newUser':
          this.apiSvc.crudUserFromApi(this.state.newItem, 'AddUser').then(res => {
            console.log('addningOutput', res)
            this._getUsers()
          })
          break;
        case 'removeUser':
          this.apiSvc.crudUserFromApi(this.state.newItem, 'DeleteUser').then(res => {
            console.log('addningOutput', res)
            this._getUsers()
          })
          break;
        case 'editUser':
          this.apiSvc.crudUserFromApi(this.state.newItem, 'UpdateUser').then(res => {
            console.log('addningOutput', res)
            this._getUsers()
          })
          break;
        default:
          break;
      }

    })
  }

  public handleCountryChange = (input) => {

    const target = input.target;
    // console.log ('Target', target);
    const value = target.type === 'checkbox' ? target.checked : target.value;
    // const name = target.name;
    const selectedItem = this.state.countriesDropdown.filter((item) => { return (item.text === value); })[0];

    if (selectedItem !== undefined) {
      this.handleCountrySelect(selectedItem);
    } else {

    }
  }

  public handleCountrySelect = (input) => {

    if (input === undefined) { return; }
    this.setState({
      newItem: {
        ...this.state.newItem,
        Country: input.key
      }
    });
  }

  public handleInputChange = (event) => {

    const target = event.target;
    let value = target.value;
    const name = target.name;

    this.setState({
      newItem: {
        ...this.state.newItem,
        [name]: value
      }
    });

  }

  private _closeDialog = (): void => {
    this.setState({
      hideDialog: true
    });
  }

  @autobind
  private _getSelection(item) {
    this.setState({
      buttonsDisabled: item.length === 0 ? true : false,
      newItem: {
        FirstName: item.length === 0 ? '' : item[0].FirstName,
        LastName: item.length === 0 ? '' : item[0].LastName,
        Country: item.length === 0 ? '' : item[0].Country,
        RowKey: item.length === 0 ? '' : item[0].RowKey
      }
    }, () => { console.log('Selected item:', this.state.newItem) });
  }

  public componentDidMount() {
    // Load the items
    //this._getMockUpUsers();
    this._getUsers()
    this._getCountries()
  }

  @autobind
  private _getMockUpUsers() {
    this.setState({
      users: this.apiSvc.getMockupData()
    });
  }

  @autobind
  private _getUsers() {
    this.setState({
      loading: true
    });

    this.apiSvc.getUsersFromApi().then(res => {
      this.setState({
        users: res,
        loading: false
      }, () => { console.log('UsersState', this.state.users) });;
    })
  }

  @autobind
  private _getCountries() {
    this.apiSvc.getCountriesFromApi().then(res => {
      let countriesDropdown = res.map((country) => {
        return { key: country.Name, text: country.Name };
      })
      this.setState({
        countries: res,
        countriesDropdown: countriesDropdown
      }, () => { console.log('CountriesState', this.state.countries) });;
    })
  }

}
